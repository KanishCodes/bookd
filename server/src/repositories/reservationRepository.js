import mongoose from 'mongoose';
import { INITIAL_RESERVATIONS } from '../data/seedData.js';
import { issueRepository } from './issueRepository.js';
import { bookRepository } from './bookRepository.js';
import { Reservation } from '../models/Reservation.js';

const DAY = 24 * 60 * 60 * 1000;

export const toPublicReservation = (res) => {
  if (!res) return null;
  const obj = typeof res.toObject === 'function' ? res.toObject({ virtuals: true }) : { ...res };
  delete obj.__v;
  obj.id = obj.customId || obj.id || obj._id?.toString();
  obj.position = obj.queuePosition || obj.position;
  return obj;
};

class ReservationRepository {
  constructor() {
    this.reservations = INITIAL_RESERVATIONS.map((r) => ({ ...r }));
    this.seq = 0;
  }

  // The client displays isbn and shelf location, enrich from book repo
  async _enrich(r) {
    if (!r) return null;
    const book = await bookRepository.getById(r.bookId);
    return {
      ...r,
      isbn: book?.isbn || '',
      shelfLocation: book?.shelfLocation || '',
    };
  }

  async getAll({ userId } = {}) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (userId) query.userId = userId;
        query.status = { $in: ['WAITING', 'READY_FOR_PICKUP'] };

        const docs = await Reservation.find(query).sort({ queuePosition: 1, reservedAt: 1 });
        if (docs && docs.length > 0) {
          const list = docs.map((d) => toPublicReservation(d));
          return Promise.all(list.map((r) => this._enrich(r)));
        }
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB getAll fallback to memory:', err.message);
      }
    }

    const list = this.reservations.filter((r) => !userId || r.userId === userId);
    return Promise.all(list.map((r) => this._enrich(r)));
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
        const doc = await Reservation.findOne(query);
        if (doc) return this._enrich(toPublicReservation(doc));
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB getById fallback to memory:', err.message);
      }
    }
    const r = this.reservations.find((x) => x.id === id || x.customId === id);
    return r ? this._enrich(r) : null;
  }

  async exists(userId, bookId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Reservation.findOne({
          userId,
          bookId,
          status: { $in: ['WAITING', 'READY_FOR_PICKUP'] },
        });
        if (doc) return true;
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB exists fallback to memory:', err.message);
      }
    }
    return this.reservations.some(
      (r) => r.userId === userId && r.bookId === bookId && r.status !== 'CANCELLED' && r.status !== 'FULFILLED'
    );
  }

  // Earliest due date among current loans of the title, +14 days per extra place in queue
  async _estimate(bookId, position) {
    const loans = (await issueRepository.getAll()).filter(
      (i) => i.bookId === bookId && !i.returnedAt
    );
    const earliest = loans.length
      ? Math.min(...loans.map((i) => new Date(i.dueAt).getTime()))
      : Date.now();
    return new Date(Math.max(earliest, Date.now()) + (position - 1) * 14 * DAY)
      .toISOString()
      .slice(0, 10);
  }

  async _renumber(bookId) {
    this.reservations
      .filter((r) => r.bookId === bookId && r.status === 'WAITING')
      .sort((a, b) => new Date(a.reservedAt) - new Date(b.reservedAt))
      .forEach((r, i) => {
        r.queuePosition = i + 1;
      });

    if (mongoose.connection.readyState === 1) {
      try {
        const remaining = await Reservation.find({
          bookId,
          status: 'WAITING',
        }).sort({ reservedAt: 1 });

        for (let i = 0; i < remaining.length; i++) {
          remaining[i].queuePosition = i + 1;
          await remaining[i].save();
        }
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB renumber warning:', err.message);
      }
    }
  }

  async create({ book, user }) {
    let position = this.reservations.filter(
      (r) => r.bookId === book.id && r.status === 'WAITING'
    ).length + 1;

    if (mongoose.connection.readyState === 1) {
      try {
        const count = await Reservation.countDocuments({
          bookId: book.id,
          status: 'WAITING',
        });
        position = count + 1;
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB count fallback to memory:', err.message);
      }
    }

    const estimatedDate = await this._estimate(book.id, position);
    const customId = `res-${Date.now()}-${++this.seq}`;

    const reservationPayload = {
      customId,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      userId: user.id,
      userName: user.name,
      memberId: user.memberId,
      queuePosition: position,
      status: 'WAITING',
      reservedAt: new Date(),
      estimatedDate,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Reservation.create(reservationPayload);
        const pub = toPublicReservation(doc);
        this.reservations.push(pub);
        return this._enrich(pub);
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB create fallback to memory:', err.message);
      }
    }

    const memRes = {
      id: customId,
      ...reservationPayload,
      reservedAt: new Date().toISOString(),
    };
    this.reservations.push(memRes);
    return this._enrich(memRes);
  }

  async remove(id) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const doc = await Reservation.findOne(query);
        if (doc) {
          doc.status = 'CANCELLED';
          await doc.save();
          await this._renumber(doc.bookId);
          return true;
        }
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB remove fallback to memory:', err.message);
      }
    }

    const index = this.reservations.findIndex((r) => r.id === id || r.customId === id);
    if (index === -1) return false;
    const [removed] = this.reservations.splice(index, 1);
    this._renumber(removed.bookId);
    return true;
  }

  // When a copy is returned, mark the next waiting person ready
  async markNextReady(bookId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const next = await Reservation.findOneAndUpdate(
          { bookId, status: 'WAITING' },
          { status: 'READY_FOR_PICKUP', notifiedAt: new Date() },
          { sort: { queuePosition: 1 }, new: true }
        );
        if (next) return;
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB markNextReady fallback to memory:', err.message);
      }
    }

    const next = this.reservations
      .filter((r) => r.bookId === bookId && r.status === 'WAITING')
      .sort((a, b) => a.queuePosition - b.queuePosition)[0];
    if (next) {
      next.status = 'READY_FOR_PICKUP';
      next.notifiedAt = new Date().toISOString();
    }
  }

  // Borrowing a reserved title clears the reservation hold
  async fulfill(userId, bookId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Reservation.findOne({
          userId,
          bookId,
          status: { $in: ['WAITING', 'READY_FOR_PICKUP'] },
        });
        if (doc) {
          doc.status = 'FULFILLED';
          await doc.save();
          await this._renumber(bookId);
          return;
        }
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB fulfill fallback to memory:', err.message);
      }
    }

    const r = this.reservations.find(
      (x) => x.userId === userId && x.bookId === bookId && x.status !== 'CANCELLED'
    );
    if (r) this.remove(r.id);
  }
}

export const reservationRepository = new ReservationRepository();
