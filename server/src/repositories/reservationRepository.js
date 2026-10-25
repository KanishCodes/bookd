import { INITIAL_RESERVATIONS } from '../data/seedData.js';
import { issueRepository } from './issueRepository.js';
import { bookRepository } from './bookRepository.js';

const DAY = 24 * 60 * 60 * 1000;

class ReservationRepository {
  constructor() {
    this.reservations = INITIAL_RESERVATIONS.map(r => ({ ...r }));
    this.seq = 0;
  }

  // The client shows isbn and shelf location, which the seed rows don't carry
  async _enrich(r) {
    const book = await bookRepository.getById(r.bookId);
    return { ...r, isbn: book?.isbn || '', shelfLocation: book?.shelfLocation || '' };
  }

  async getAll({ userId } = {}) {
    const list = this.reservations.filter(r => !userId || r.userId === userId);
    return Promise.all(list.map(r => this._enrich(r)));
  }

  async getById(id) {
    const r = this.reservations.find(x => x.id === id);
    return r ? this._enrich(r) : null;
  }

  exists(userId, bookId) {
    return this.reservations.some(r => r.userId === userId && r.bookId === bookId);
  }

  // Earliest due date among current loans of the title, +14 days per extra place in the queue
  async _estimate(bookId, position) {
    const loans = (await issueRepository.getAll()).filter(i => i.bookId === bookId && !i.returnedAt);
    const earliest = loans.length ? Math.min(...loans.map(i => new Date(i.dueAt).getTime())) : Date.now();
    return new Date(Math.max(earliest, Date.now()) + (position - 1) * 14 * DAY).toISOString().slice(0, 10);
  }

  _renumber(bookId) {
    this.reservations
      .filter(r => r.bookId === bookId)
      .sort((a, b) => new Date(a.reservedAt) - new Date(b.reservedAt))
      .forEach((r, i) => { r.queuePosition = i + 1; });
  }

  async create({ book, user }) {
    const position = this.reservations.filter(r => r.bookId === book.id).length + 1;
    const reservation = {
      id: `res-${Date.now()}-${++this.seq}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      userId: user.id,
      userName: user.name,
      memberId: user.memberId,
      reservedAt: new Date().toISOString(),
      queuePosition: position,
      status: 'WAITING',
      estimatedDate: await this._estimate(book.id, position)
    };
    this.reservations.push(reservation);
    return this._enrich(reservation);
  }

  remove(id) {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index === -1) return false;
    const [removed] = this.reservations.splice(index, 1);
    this._renumber(removed.bookId);
    return true;
  }

  // When a copy comes back, the first person in the queue can collect it
  markNextReady(bookId) {
    const next = this.reservations
      .filter(r => r.bookId === bookId && r.status === 'WAITING')
      .sort((a, b) => a.queuePosition - b.queuePosition)[0];
    if (next) next.status = 'READY_FOR_PICKUP';
  }

  // Borrowing a reserved title clears the hold
  fulfill(userId, bookId) {
    const r = this.reservations.find(x => x.userId === userId && x.bookId === bookId);
    if (r) this.remove(r.id);
  }
}

export const reservationRepository = new ReservationRepository();