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
      status: issue.returnedAt ? 'RETURNED' : currentStatus,
      fineAmount: fine,
    };
  }

  async getAll({ status, userId } = {}) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (userId) query.userId = userId;
        if (status) query.status = status.toUpperCase();

        const docs = await IssueRecord.find(query).sort({ issuedAt: -1 });
        if (docs && docs.length > 0) {
          return docs.map((doc) => {
            const pub = toPublicIssue(doc);
            return this._enrichIssue(pub);
          });
        }
      } catch (err) {
        console.warn('[IssueRepo] MongoDB getAll fallback to memory:', err.message);
      }
    }

    let result = this.issues.map((iss) => this._enrichIssue(iss));
    if (userId) {
      result = result.filter((iss) => iss.userId === userId);
    }
    if (status) {
      result = result.filter((iss) => iss.status.toLowerCase() === status.toLowerCase());
    }
    return result;
  }

  async getById(id) {
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
        console.warn('[IssueRepo] MongoDB getById fallback to memory:', err.message);
      }
    }
    const found = this.issues.find((iss) => iss.id === id || iss.customId === id);
    return found ? this._enrichIssue(found) : null;
  }

  async hasActiveLoan(userId, bookId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const active = await IssueRecord.findOne({
          userId,
          bookId,
          returnedAt: null,
        });
        if (active) return true;
      } catch (err) {
        console.warn('[IssueRepo] MongoDB hasActiveLoan fallback to memory:', err.message);
      }
    }
    return this.issues.some(
      (i) => i.userId === userId && i.bookId === bookId && !i.returnedAt
    );
  }

  async countActiveLoans(userId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await IssueRecord.countDocuments({
          userId,
          returnedAt: null,
        });
        return count;
      } catch (err) {
        console.warn('[IssueRepo] MongoDB countActiveLoans fallback to memory:', err.message);
      }
    }
    return this.issues.filter((i) => i.userId === userId && !i.returnedAt).length;
  }

  /**
   * Issue a book atomically using Mongoose transaction/session and conditional decrement.
   * Prevents race conditions when concurrent requests attempt to checkout the last copy.
   */
  async createIssue({ bookId, bookTitle, bookAuthor, userId, userName, userEmail, memberId }) {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const customId = `iss-${Date.now()}-${++this.seq}`;

    const issuePayload = {
      customId,
      bookId,
      bookTitle,
      bookAuthor: bookAuthor || 'Author',
      userId,
      userName: userName || 'Library Member',
      userEmail: userEmail || '',
      memberId: memberId || 'MEM-000',
      issuedAt: now,
      dueAt: dueDate,
      returnedAt: null,
      renewCount: 0,
      fineAmount: 0,
      status: 'ACTIVE',
    };

    if (mongoose.connection.readyState === 1) {
      let session = null;
      try {
        session = await mongoose.startSession();
        let createdIssue = null;

        // Try replica set transaction; if unsupported (standalone mongod), fallback to atomic conditional query
        try {
          await session.withTransaction(async () => {
            // ATOMIC RACE CONDITION GUARD:
            // Decrement ONLY IF availableCopies > 0 inside the session
            const bookQuery = {
              $or: [
                { customId: bookId },
                ...(mongoose.isValidObjectId(bookId) ? [{ _id: bookId }] : []),
              ],
              availableCopies: { $gt: 0 },
            };

            const updatedBook = await Book.findOneAndUpdate(
              bookQuery,
              { $inc: { availableCopies: -1 } },
              { session, new: true }
            );

            if (!updatedBook) {
              const err = new Error('No available copies remaining for this title');
              err.status = 400;
              throw err;
            }

            const docs = await IssueRecord.create([issuePayload], { session });
            createdIssue = docs[0];
          });
        } catch (txnError) {
          // If transaction fails specifically because standalone MongoDB lacks replica set oplog
          if (txnError.message?.includes('Transaction numbers are only allowed') ||
              txnError.message?.includes('replica set')) {
            console.warn('[IssueRepo] Standalone MongoDB detected; falling back to direct atomic query.');
            
            const bookQuery = {
              $or: [
                { customId: bookId },
                ...(mongoose.isValidObjectId(bookId) ? [{ _id: bookId }] : []),
              ],
              availableCopies: { $gt: 0 },
            };

            const updatedBook = await Book.findOneAndUpdate(
              bookQuery,
              { $inc: { availableCopies: -1 } },
              { new: true }
            );

            if (!updatedBook) {
              const err = new Error('No available copies remaining for this title');
              err.status = 400;
              throw err;
            }

            createdIssue = await IssueRecord.create(issuePayload);
          } else {
            throw txnError;
          }
        }

        if (createdIssue) {
          const publicIssue = this._enrichIssue(toPublicIssue(createdIssue));
          this.issues.unshift(publicIssue);
          return publicIssue;
        }
      } catch (err) {
        if (err.status) throw err;
        console.warn('[IssueRepo] MongoDB createIssue fallback to memory:', err.message);
      } finally {
        if (session) await session.endSession();
      }
    }

    // In-memory checkout fallback
    const memBook = await bookRepository.getById(bookId);
    if (!memBook || memBook.availableCopies <= 0) {
      const err = new Error('No available copies remaining for this title');
      err.status = 400;
      throw err;
    }

    const newIssue = {
      id: customId,
      ...issuePayload,
      issuedAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
    };

    this.issues.unshift(newIssue);
    await bookRepository.adjustAvailableCopies(bookId, -1);
    return this._enrichIssue(newIssue);
  }

  async returnIssue(id) {
    const now = new Date();
    const nowIso = now.toISOString();

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

          // Increment available copies atomically
          await bookRepository.adjustAvailableCopies(existing.bookId, 1);
          return this._enrichIssue(toPublicIssue(existing));
        }
      } catch (err) {
        if (err.status) throw err;
        console.warn('[IssueRepo] MongoDB returnIssue fallback to memory:', err.message);
      }
    }

    const index = this.issues.findIndex((iss) => iss.id === id || iss.customId === id);
    if (index === -1) return null;

    const issue = this.issues[index];
    if (issue.returnedAt) {
      const err = new Error('This loan has already been returned');
      err.status = 400;
      throw err;
    }

    const fine = calculateFine(issue.dueAt, nowIso);
    issue.returnedAt = nowIso;
    issue.status = 'RETURNED';
    issue.fineAmount = fine;

    await bookRepository.adjustAvailableCopies(issue.bookId, 1);
    return this._enrichIssue(issue);
  }

  async renewIssue(id) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };

        const issue = await IssueRecord.findOne(query);
        if (issue) {
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
          issue.dueAt = extended;
          issue.renewCount += 1;
          issue.status = getIssueStatus(extended, null);
          issue.fineAmount = calculateFine(extended, null);
          await issue.save();

          return this._enrichIssue(toPublicIssue(issue));
        }
      } catch (err) {
        if (err.status) throw err;
        console.warn('[IssueRepo] MongoDB renewIssue fallback to memory:', err.message);
      }
    }

    const index = this.issues.findIndex((iss) => iss.id === id || iss.customId === id);
    if (index === -1) return null;

    const issue = this.issues[index];
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

    return this._enrichIssue(issue);
  }
}

export const issueRepository = new IssueRepository();
