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
    let list = this.reservations.filter((r) => (!userId || r.userId === userId) && r.status !== 'CANCELLED' && r.status !== 'FULFILLED');
    return Promise.all(list.map((r) => this._enrich(r)));
  }

  async getById(id) {
    const r = this.reservations.find((x) => x.id === id || x.customId === id);
    return r ? this._enrich(r) : null;
  }

  async exists(userId, bookId) {
    return this.reservations.some(
      (r) => r.userId === userId && r.bookId === bookId && (r.status === 'WAITING' || r.status === 'READY_FOR_PICKUP')
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

  _renumber(bookId) {
    this.reservations
      .filter((r) => r.bookId === bookId && (r.status === 'WAITING' || r.status === 'READY_FOR_PICKUP'))
      .sort((a, b) => new Date(a.reservedAt) - new Date(b.reservedAt))
      .forEach((r, i) => {
        r.queuePosition = i + 1;
      });

    if (mongoose.connection.readyState === 1) {
      Reservation.find({ bookId, status: { $in: ['WAITING', 'READY_FOR_PICKUP'] } })
        .sort({ reservedAt: 1 })
        .then(async (docs) => {
          for (let i = 0; i < docs.length; i++) {
            docs[i].queuePosition = i + 1;
            await docs[i].save();
          }
        })
        .catch(() => {});
    }
  }

  async create({ book, user }) {
    const position = this.reservations.filter(
      (r) => r.bookId === book.id && (r.status === 'WAITING' || r.status === 'READY_FOR_PICKUP')
    ).length + 1;

    const estimatedDate = await this._estimate(book.id, position);
    const customId = `res-${Date.now()}-${++this.seq}`;

    const reservationPayload = {
      id: customId,
      customId,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      userId: user.id,
      userName: user.name,
      memberId: user.memberId,
      queuePosition: position,
      status: 'WAITING',
      reservedAt: new Date().toISOString(),
      estimatedDate,
    };

    this.reservations.push(reservationPayload);

    if (mongoose.connection.readyState === 1) {
      try {
        await Reservation.create({
          ...reservationPayload,
          reservedAt: new Date(),
        });
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB create reservation fallback:', err.message);
      }
    }

    return this._enrich(reservationPayload);
  }

  async remove(id) {
    const index = this.reservations.findIndex((r) => r.id === id || r.customId === id);
    if (index !== -1) {
      const [removed] = this.reservations.splice(index, 1);
      this._renumber(removed.bookId);
    }

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
          this._renumber(doc.bookId);
        }
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB remove fallback to memory:', err.message);
      }
    }

    return true;
  }

  // When a copy is returned, mark the next waiting person ready
  async markNextReady(bookId) {
    const next = this.reservations
      .filter((r) => r.bookId === bookId && r.status === 'WAITING')
      .sort((a, b) => a.queuePosition - b.queuePosition)[0];

    if (next) {
      next.status = 'READY_FOR_PICKUP';
      next.notifiedAt = new Date().toISOString();
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await Reservation.findOneAndUpdate(
          { bookId, status: 'WAITING' },
          { status: 'READY_FOR_PICKUP', notifiedAt: new Date() },
          { sort: { queuePosition: 1 } }
        );
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB markNextReady fallback to memory:', err.message);
      }
    }
  }

  // Borrowing a reserved title clears the reservation hold
  async fulfill(userId, bookId) {
    const r = this.reservations.find(
      (x) => x.userId === userId && x.bookId === bookId && x.status !== 'CANCELLED'
    );
    if (r) this.remove(r.id);

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
          this._renumber(bookId);
        }
      } catch (err) {
        console.warn('[ReservationRepo] MongoDB fulfill fallback to memory:', err.message);
      }
    }
  }
}

export const reservationRepository = new ReservationRepository();
