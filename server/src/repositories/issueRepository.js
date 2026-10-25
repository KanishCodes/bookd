import { INITIAL_ISSUES } from '../data/seedData.js';
import { calculateFine, getIssueStatus } from '../utils/fines.js';
import { bookRepository } from './bookRepository.js';

/**
 * ============================================================================
 * TODO: NAISHA - In-Memory Issue / Circulation Repository
 * ============================================================================
 * Issue shape:
 * {
 *   id: string,
 *   bookId: string,
 *   bookTitle: string,
 *   bookAuthor: string,
 *   userId: string,
 *   userName: string,
 *   userEmail: string,
 *   memberId: string,
 *   issuedAt: ISO string,
 *   dueAt: ISO string,
 *   returnedAt: ISO string | null,
 *   renewCount: number,
 *   fineAmount: number,
 *   status: 'ACTIVE' | 'OVERDUE' | 'RETURNED'
 * }
 */

class IssueRepository {
  constructor() {
    this.issues = INITIAL_ISSUES.map(i => ({ ...i })); // clone so seed data is never mutated
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
      fineAmount: fine
    };
  }

  async getAll({ status, userId } = {}) {
    let result = this.issues.map(iss => this._enrichIssue(iss));

    if (userId) {
      result = result.filter(iss => iss.userId === userId);
    }

    if (status) {
      result = result.filter(iss => iss.status.toLowerCase() === status.toLowerCase());
    }

    return result;
  }

  async getById(id) {
    const found = this.issues.find(iss => iss.id === id);
    return found ? this._enrichIssue(found) : null;
  }
  async hasActiveLoan(userId, bookId) {
    return this.issues.some(
      i => i.userId === userId && i.bookId === bookId && !i.returnedAt
    );
  }

  async countActiveLoans(userId) {
    return this.issues.filter(i => i.userId === userId && !i.returnedAt).length;
  }
  async createIssue({ bookId, bookTitle, bookAuthor, userId, userName, userEmail, memberId }) {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days loan

    const newIssue = {
      id: `iss-${Date.now()}-${++this.seq}`,
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
      status: 'ACTIVE'
    };

    this.issues.unshift(newIssue);
    // Decrease available copies of book
    await bookRepository.adjustAvailableCopies(bookId, -1);
    return this._enrichIssue(newIssue);
  }

  async returnIssue(id) {
    const index = this.issues.findIndex(iss => iss.id === id);
    if (index === -1) return null;

    const issue = this.issues[index];
        if (issue.returnedAt) {
      const err = new Error('This loan has already been returned');
      err.status = 400;
      throw err;
    }
    const now = new Date().toISOString();
    const fine = calculateFine(issue.dueAt, now);

    issue.returnedAt = now;
    issue.status = 'RETURNED';
    issue.fineAmount = fine;

    // Increase available copies of book
    await bookRepository.adjustAvailableCopies(issue.bookId, 1);
    return this._enrichIssue(issue);
  }

  async renewIssue(id) {
    const index = this.issues.findIndex(iss => iss.id === id);
    if (index === -1) return null;

    const issue = this.issues[index];
    if (issue.returnedAt) {
      throw new Error('Cannot renew an already returned book');
    }
    if (issue.renewCount >= 2) {
      throw new Error('Maximum renewal limit (2 times) reached for this loan');
    }

    // Extend due date by 14 days from current due date
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
