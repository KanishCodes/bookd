import mongoose from 'mongoose';
import { INITIAL_ISSUES } from '../data/seedData.js';
import { calculateFine, getIssueStatus } from '../utils/fines.js';
import { bookRepository } from './bookRepository.js';
import { IssueRecord } from '../models/IssueRecord.js';
import { Book } from '../models/Book.js';

export const toPublicIssue = (issue) => {
  if (!issue) return null;
  const obj = typeof issue.toObject === 'function' ? issue.toObject({ virtuals: true }) : { ...issue };
  delete obj.__v;
  obj.id = obj.customId || obj.id || obj._id?.toString();
  if (obj.issuedAt instanceof Date) obj.issuedAt = obj.issuedAt.toISOString();
  if (obj.dueAt instanceof Date) obj.dueAt = obj.dueAt.toISOString();
  if (obj.returnedAt instanceof Date) obj.returnedAt = obj.returnedAt.toISOString();
  return obj;
};

class IssueRepository {
  constructor() {
    this.issues = INITIAL_ISSUES.map((i) => ({ ...i }));
    this.seq = 0;
  }

  // Refresh status and fines on current records dynamically
  _enrichIssue(issue) {
    if (!issue) return null;
    const currentStatus = getIssueStatus(issue.dueAt, issue.returnedAt);
    const fine = calculateFine(issue.dueAt, issue.returnedAt);
    return {
      ...issue,
      dueAt: issue.dueAt instanceof Date ? issue.dueAt.toISOString() : String(issue.dueAt),
      issuedAt: issue.issuedAt instanceof Date ? issue.issuedAt.toISOString() : String(issue.issuedAt),
      returnedAt: issue.returnedAt ? (issue.returnedAt instanceof Date ? issue.returnedAt.toISOString() : String(issue.returnedAt)) : null,
      status: issue.returnedAt ? 'RETURNED' : currentStatus,
      fineAmount: fine,
    };
  }

  async getAll({ status, userId } = {}) {
    let list = this.issues.map((iss) => this._enrichIssue(iss));

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (userId) query.userId = userId;
        if (status) query.status = status.toUpperCase();

        const docs = await IssueRecord.find(query).sort({ issuedAt: -1 });
        const existingIds = new Set(list.map((i) => i.id || i.customId));
        for (const doc of docs) {
          const pub = this._enrichIssue(toPublicIssue(doc));
          if (!existingIds.has(pub.id)) {
            list.unshift(pub);
          }
        }
      } catch (err) {
        console.warn('[IssueRepo] MongoDB getAll warning:', err.message);
      }
    }

    if (userId) {
      list = list.filter((iss) => iss.userId === userId);
    }
    if (status) {
      list = list.filter((iss) => iss.status.toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  async getById(id) {
    const foundMem = this.issues.find((iss) => iss.id === id || iss.customId === id);
    if (foundMem) return this._enrichIssue(foundMem);

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const doc = await IssueRecord.findOne(query);
        if (doc) return this._enrichIssue(toPublicIssue(doc));
      } catch (err) {
        console.warn('[IssueRepo] MongoDB getById warning:', err.message);
      }
    }
    return null;
  }

  async hasActiveLoan(userId, bookId) {
    if (this.issues.some((i) => i.userId === userId && i.bookId === bookId && !i.returnedAt)) {
      return true;
    }
    if (mongoose.connection.readyState === 1) {
      try {
        const active = await IssueRecord.findOne({
          userId,
          bookId,
          returnedAt: null,
        });
        if (active) return true;
      } catch (err) {
        console.warn('[IssueRepo] MongoDB hasActiveLoan warning:', err.message);
      }
    }
    return false;
  }

  async countActiveLoans(userId) {
    let dbCount = 0;
    if (mongoose.connection.readyState === 1) {
      try {
        dbCount = await IssueRecord.countDocuments({
          userId,
          returnedAt: null,
        });
      } catch (err) {
        console.warn('[IssueRepo] MongoDB countActiveLoans warning:', err.message);
      }
    }
    const memCount = this.issues.filter((i) => i.userId === userId && !i.returnedAt).length;
    return Math.max(dbCount, memCount);
  }

  /**
   * Atomic issue logic with inventory check across MongoDB and standard catalog.
   */
  async createIssue({ bookId, bookTitle, bookAuthor, userId, userName, userEmail, memberId }) {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const customId = `iss-${Date.now()}-${++this.seq}`;

    const issuePayload = {
      id: customId,
      customId,
      bookId,
      bookTitle,
      bookAuthor: bookAuthor || 'Author',
      userId,
      userName: userName || 'Library Member',
      userEmail: userEmail || '',
      memberId: memberId || 'MEM-000',
      issuedAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
      returnedAt: null,
      renewCount: 0,
      fineAmount: 0,
      status: 'ACTIVE',
    };

    // 1. Decrement available copy atomically in memory and DB
    await bookRepository.adjustAvailableCopies(bookId, -1);

    // 2. Persist issue record
    if (mongoose.connection.readyState === 1) {
      try {
        const createdIssue = await IssueRecord.create({
          ...issuePayload,
          issuedAt: now,
          dueAt: dueDate,
        });

        const publicIssue = this._enrichIssue(toPublicIssue(createdIssue));
        this.issues.unshift(publicIssue);
        return publicIssue;
      } catch (err) {
        // Roll back copy decrement if issue creation failed
        await bookRepository.adjustAvailableCopies(bookId, 1);
        if (err.status === 400) throw err;
        console.warn('[IssueRepo] MongoDB createIssue warning:', err.message);
      }
    }

    this.issues.unshift(issuePayload);
    return this._enrichIssue(issuePayload);
  }

  async returnIssue(id) {
    const now = new Date();
    const nowIso = now.toISOString();

    let bookId = null;
    let foundIssue = null;

    const memIndex = this.issues.findIndex((iss) => iss.id === id || iss.customId === id);
    if (memIndex !== -1) {
      const memIssue = this.issues[memIndex];
      if (memIssue.returnedAt) {
        const err = new Error('This loan has already been returned');
        err.status = 400;
        throw err;
      }
      const fine = calculateFine(memIssue.dueAt, nowIso);
      memIssue.returnedAt = nowIso;
      memIssue.status = 'RETURNED';
      memIssue.fineAmount = fine;
      bookId = memIssue.bookId;
      foundIssue = memIssue;
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };

        const existing = await IssueRecord.findOne(query);
        if (existing) {
          if (existing.returnedAt) {
            const err = new Error('This loan has already been returned');
            err.status = 400;
            throw err;
          }

          const fine = calculateFine(existing.dueAt, now);
          existing.returnedAt = now;
          existing.status = 'RETURNED';
          existing.fineAmount = fine;
          await existing.save();

          bookId = existing.bookId;
          foundIssue = toPublicIssue(existing);
        }
      } catch (err) {
        if (err.status) throw err;
        console.warn('[IssueRepo] MongoDB returnIssue warning:', err.message);
      }
    }

    if (!foundIssue) return null;

    if (bookId) {
      await bookRepository.adjustAvailableCopies(bookId, 1);
    }

    return this._enrichIssue(foundIssue);
  }

  async renewIssue(id) {
    let issue = this.issues.find((iss) => iss.id === id || iss.customId === id);

    if (mongoose.connection.readyState === 1 && !issue) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const doc = await IssueRecord.findOne(query);
        if (doc) {
          issue = toPublicIssue(doc);
          this.issues.push(issue);
        }
      } catch (err) {
        console.warn('[IssueRepo] MongoDB renew lookup warning:', err.message);
      }
    }

    if (!issue) return null;

    if (issue.returnedAt) {
      const err = new Error('Cannot renew an already returned book');
      err.status = 400;
      throw err;
    }
    if (issue.renewCount >= 2) {
      const err = new Error('Maximum renewal limit (2 times) reached for this loan');
      err.status = 400;
      throw err;
    }

    const currentDue = new Date(issue.dueAt);
    const extended = new Date(currentDue.getTime() + 14 * 24 * 60 * 60 * 1000);
    issue.dueAt = extended.toISOString();
    issue.renewCount += 1;
    issue.status = getIssueStatus(issue.dueAt, null);
    issue.fineAmount = calculateFine(issue.dueAt, null);

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const doc = await IssueRecord.findOne(query);
        if (doc) {
          doc.dueAt = extended;
          doc.renewCount += 1;
          doc.status = issue.status;
          doc.fineAmount = issue.fineAmount;
          await doc.save();
        }
      } catch (err) {
        console.warn('[IssueRepo] MongoDB renew sync warning:', err.message);
      }
    }

    return this._enrichIssue(issue);
  }
}

export const issueRepository = new IssueRepository();
