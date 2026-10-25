import { issueRepository } from './issueRepository.js';
import { bookRepository } from './bookRepository.js';
import { INITIAL_ISSUES } from '../data/seedData.js';
import { FINE_RATE_PER_DAY, getOverdueDays } from '../utils/fines.js';

// Seed loans that were returned late and whose fine was already settled before this
// server started (see seedData comment "Paid 20 fine"). They are part of the seeded
// totalFinesCollected figure, so they are not outstanding and not counted again.
const SETTLED_SEED_ISSUES = new Set(
  INITIAL_ISSUES.filter(i => i.returnedAt && i.fineAmount > 0).map(i => i.id)
);

class FineRepository {
  constructor() {
    this.payments = []; // { issueId, userId, amount, method, transactionId, paidAt }
  }

  _paidFor(issueId) {
    return this.payments.filter(p => p.issueId === issueId).reduce((s, p) => s + p.amount, 0);
  }

  // Outstanding fines = what the loan owes minus what has been paid
  async getAll({ userId } = {}) {
    const issues = await issueRepository.getAll({ userId });
    const fines = [];
    for (const iss of issues) {
      if (SETTLED_SEED_ISSUES.has(iss.id)) continue;
      const outstanding = iss.fineAmount - this._paidFor(iss.id);
      if (outstanding <= 0) continue;
      const book = await bookRepository.getById(iss.bookId);
      fines.push({
        id: `fine-${iss.id}`,
        userId: iss.userId,
        issueId: iss.id,
        bookTitle: iss.bookTitle,
        isbn: book?.isbn || '',
        dueDate: iss.dueAt.slice(0, 10),
        overdueDays: getOverdueDays(iss.dueAt, iss.returnedAt),
        dailyRate: FINE_RATE_PER_DAY,
        amount: outstanding,
        status: 'UNPAID'
      });
    }
    return fines;
  }

  async getById(id) {
    return (await this.getAll()).find(f => f.id === id) || null;
  }

  async pay(fine, method = 'CARD') {
    const payment = {
      issueId: fine.issueId,
      userId: fine.userId,
      amount: fine.amount,
      method,
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString()
    };
    this.payments.push(payment);
    return payment;
  }

  totalCollected() {
    return this.payments.reduce((s, p) => s + p.amount, 0);
  }
}

export const fineRepository = new FineRepository();