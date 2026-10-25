import { INITIAL_BOOKS } from '../data/seedData.js';

/**
 * In-Memory Book Repository
 * Abstracted data access layer so MongoDB can be dropped in for the next evaluation.
 */
class BookRepository {
  constructor() {
    this.books = [...INITIAL_BOOKS];
  }

  async getAll({ search = '', category = '', available = '' } = {}) {
    let result = [...this.books];

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      result = result.filter(
        b => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (available === 'true' || available === true) {
      result = result.filter(b => b.availableCopies > 0);
    } else if (available === 'false' || available === false) {
      result = result.filter(b => b.availableCopies === 0);
    }

    return result;
  }

  async getById(id) {
    return this.books.find(b => b.id === id) || null;
  }

  async create(bookData) {
    const newBook = {
      id: `b-${Date.now()}`,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      category: bookData.category || 'General',
      coverUrl: bookData.coverUrl || '',
      totalCopies: Number(bookData.totalCopies) || 1,
      availableCopies: Number(bookData.availableCopies ?? bookData.totalCopies) || 1,
      shelfLocation: bookData.shelfLocation || 'GEN-01',
      publicationYear: bookData.publicationYear ? Number(bookData.publicationYear) : new Date().getFullYear(),
      pages: bookData.pages ? Number(bookData.pages) : 0,
      description: bookData.description || ''
    };
    this.books.unshift(newBook);
    return newBook;
  }

  async update(id, bookData) {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return null;

    const existing = this.books[index];
    const updated = {
      ...existing,
      ...bookData,
      id: existing.id, // Preserve ID
      totalCopies: bookData.totalCopies !== undefined ? Number(bookData.totalCopies) : existing.totalCopies,
      availableCopies: bookData.availableCopies !== undefined ? Number(bookData.availableCopies) : existing.availableCopies
    };

    this.books[index] = updated;
    return updated;
  }

  async delete(id) {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.books.splice(index, 1);
    return true;
  }

  // Helper for issue/return circulation
  async adjustAvailableCopies(id, delta) {
    const book = await this.getById(id);
    if (!book) return null;
    const newAvailable = Math.max(0, Math.min(book.totalCopies, book.availableCopies + delta));
    return this.update(id, { availableCopies: newAvailable });
  }
}

export const bookRepository = new BookRepository();
