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
          return docs.map((d) => toPublicBook(d));
        }
      } catch (err) {
        console.warn('[BookRepo] MongoDB getAll fallback to memory:', err.message);
      }
    }

    // In-memory fallback
    let result = [...this.books];

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      result = result.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (available === 'true' || available === true) {
      result = result.filter((b) => b.availableCopies > 0);
    } else if (available === 'false' || available === false) {
      result = result.filter((b) => b.availableCopies === 0);
    }

    return result.map((b) => toPublicBook(b));
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

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Book.create(payload);
        return toPublicBook(doc);
      } catch (err) {
        console.warn('[BookRepo] MongoDB create fallback to memory:', err.message);
      }
    }

    const newBook = { id: customId, ...payload };
    this.books.unshift(newBook);
    return toPublicBook(newBook);
  }

  async update(id, bookData) {
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

        const doc = await Book.findOneAndUpdate(query, updatePayload, { new: true });
        if (doc) return toPublicBook(doc);
      } catch (err) {
        console.warn('[BookRepo] MongoDB update fallback to memory:', err.message);
      }
    }

    const index = this.books.findIndex((b) => b.id === id || b.customId === id);
    if (index === -1) return null;

    const existing = this.books[index];
    const updated = {
      ...existing,
      ...bookData,
      id: existing.id,
      totalCopies: bookData.totalCopies !== undefined ? Number(bookData.totalCopies) : existing.totalCopies,
      availableCopies: bookData.availableCopies !== undefined ? Number(bookData.availableCopies) : existing.availableCopies,
    };

    this.books[index] = updated;
    return toPublicBook(updated);
  }

  async delete(id) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const res = await Book.findOneAndDelete(query);
        if (res) return true;
      } catch (err) {
        console.warn('[BookRepo] MongoDB delete fallback to memory:', err.message);
      }
    }

    const index = this.books.findIndex((b) => b.id === id || b.customId === id);
    if (index === -1) return false;
    this.books.splice(index, 1);
    return true;
  }

  async adjustAvailableCopies(id, delta) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const doc = await Book.findOneAndUpdate(
          query,
          { $inc: { availableCopies: delta } },
          { new: true }
        );
        if (doc) return toPublicBook(doc);
      } catch (err) {
        console.warn('[BookRepo] MongoDB adjustAvailableCopies fallback to memory:', err.message);
      }
    }

    const book = await this.getById(id);
    if (!book) return null;
    const newAvailable = Math.max(0, Math.min(book.totalCopies, book.availableCopies + delta));
    return this.update(id, { availableCopies: newAvailable });
  }
}

export const bookRepository = new BookRepository();
