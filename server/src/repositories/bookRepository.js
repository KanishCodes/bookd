import mongoose from 'mongoose';
import { INITIAL_BOOKS } from '../data/seedData.js';
import { Book } from '../models/Book.js';

export const toPublicBook = (book) => {
  if (!book) return null;
  const obj = typeof book.toObject === 'function' ? book.toObject({ virtuals: true }) : { ...book };
  delete obj.__v;
  obj.id = obj.customId || obj.id || obj._id?.toString();
  return obj;
};

class BookRepository {
  constructor() {
    this.books = INITIAL_BOOKS.map((b) => ({ ...b }));
    this.seq = 0;
  }

  async getAll({ search = '', category = '', available = '' } = {}) {
    let result = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (search && search.trim() !== '') {
          const q = search.trim();
          query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { author: { $regex: q, $options: 'i' } },
            { isbn: { $regex: q, $options: 'i' } },
          ];
        }
        if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
          query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
        }
        if (available === 'true' || available === true) {
          query.availableCopies = { $gt: 0 };
        } else if (available === 'false' || available === false) {
          query.availableCopies = 0;
        }

        const docs = await Book.find(query).sort({ createdAt: -1 });
        if (docs && docs.length > 0) {
          result = docs.map((d) => toPublicBook(d));
        }
      } catch (err) {
        console.warn('[BookRepo] MongoDB getAll warning:', err.message);
      }
    }

    // Always merge in-memory initial books so standard catalogue is complete without purging user data
    const existingIds = new Set(result.map((b) => b.id || b.customId));
    let memBooks = [...this.books];

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      memBooks = memBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      memBooks = memBooks.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (available === 'true' || available === true) {
      memBooks = memBooks.filter((b) => b.availableCopies > 0);
    } else if (available === 'false' || available === false) {
      memBooks = memBooks.filter((b) => b.availableCopies === 0);
    }

    for (const b of memBooks) {
      if (!existingIds.has(b.id)) {
        result.push(toPublicBook(b));
      }
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
        const doc = await Book.findOne(query);
        if (doc) return toPublicBook(doc);
      } catch (err) {
        console.warn('[BookRepo] MongoDB getById fallback to memory:', err.message);
      }
    }
    const book = this.books.find((b) => b.id === id || b.customId === id);
    return book ? toPublicBook(book) : null;
  }

  async create(bookData) {
    const customId = `b-${Date.now()}-${++this.seq}`;
    const payload = {
      customId,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn.trim(),
      category: bookData.category || 'General',
      coverUrl: bookData.coverUrl || '',
      totalCopies: Number(bookData.totalCopies) || 1,
      availableCopies: Number(bookData.availableCopies ?? bookData.totalCopies) || 1,
      shelfLocation: bookData.shelfLocation || 'GEN-01',
      publicationYear: bookData.publicationYear ? Number(bookData.publicationYear) : new Date().getFullYear(),
      pages: bookData.pages ? Number(bookData.pages) : 0,
      description: bookData.description || '',
    };

    const newBook = { id: customId, ...payload };
    this.books.unshift(newBook);

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Book.create(payload);
        return toPublicBook(doc);
      } catch (err) {
        console.warn('[BookRepo] MongoDB create fallback to memory:', err.message);
      }
    }

    return toPublicBook(newBook);
  }

  async update(id, bookData) {
    const index = this.books.findIndex((b) => b.id === id || b.customId === id);
    let updatedMem = null;
    if (index !== -1) {
      const existing = this.books[index];
      updatedMem = {
        ...existing,
        ...bookData,
        id: existing.id,
        totalCopies: bookData.totalCopies !== undefined ? Number(bookData.totalCopies) : existing.totalCopies,
        availableCopies: bookData.availableCopies !== undefined ? Number(bookData.availableCopies) : existing.availableCopies,
      };
      this.books[index] = updatedMem;
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const updatePayload = { ...bookData };
        delete updatePayload.id;
        delete updatePayload._id;
        delete updatePayload.customId;

        const doc = await Book.findOneAndUpdate(query, updatePayload, { returnDocument: 'after' });
        if (doc) return toPublicBook(doc);
      } catch (err) {
        console.warn('[BookRepo] MongoDB update warning:', err.message);
      }
    }

    return updatedMem ? toPublicBook(updatedMem) : null;
  }

  async delete(id) {
    const index = this.books.findIndex((b) => b.id === id || b.customId === id);
    if (index !== -1) {
      this.books.splice(index, 1);
    }

    let deletedFromDb = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const res = await Book.findOneAndDelete(query);
        if (res) deletedFromDb = true;
      } catch (err) {
        console.warn('[BookRepo] MongoDB delete warning:', err.message);
      }
    }

    return index !== -1 || deletedFromDb;
  }

  async adjustAvailableCopies(id, delta) {
    const book = this.books.find((b) => b.id === id || b.customId === id);
    if (book) {
      if (delta < 0 && book.availableCopies <= 0) {
        const err = new Error('No available copies remaining for this title');
        err.status = 400;
        throw err;
      }
      book.availableCopies = Math.max(0, Math.min(book.totalCopies, book.availableCopies + delta));
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
          ...(delta < 0 ? { availableCopies: { $gt: 0 } } : {}),
        };
        const doc = await Book.findOneAndUpdate(
          query,
          { $inc: { availableCopies: delta } },
          { returnDocument: 'after' }
        );
        if (delta < 0 && !doc) {
          if (book) book.availableCopies = Math.max(0, book.availableCopies - delta);
          const err = new Error('No available copies remaining for this title');
          err.status = 400;
          throw err;
        }
        if (doc) {
          if (book) book.availableCopies = doc.availableCopies;
          return toPublicBook(doc);
        }
      } catch (err) {
        if (err.status) throw err;
        console.warn('[BookRepo] MongoDB adjustAvailableCopies warning:', err.message);
      }
    }

    return book ? toPublicBook(book) : null;
  }
}

export const bookRepository = new BookRepository();
