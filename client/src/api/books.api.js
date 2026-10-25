import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

/**
 * Books API Service
 * Contract:
 * - GET    /api/books?search=&category=&available=
 * - GET    /api/books/:id
 * - POST   /api/books
 * - PUT    /api/books/:id
 * - DELETE /api/books/:id
 */

export const getBooks = async ({ search = '', category = '', available = '' } = {}) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    let result = [...mockState.books];

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

    return result;
  }

  const response = await apiClient.get('/books', {
    params: { search, category, available }
  });
  return response.data;
};

export const getBookById = async (id) => {
  if (isMockMode()) {
    await mockDelay(null, 150);
    const book = mockState.books.find((b) => b.id === id);
    if (!book) {
      const err = new Error('Book not found');
      err.response = { status: 404, data: { message: 'Book not found' } };
      throw err;
    }
    return book;
  }

  const response = await apiClient.get(`/books/${id}`);
  return response.data;
};

export const createBook = async (bookData) => {
  if (isMockMode()) {
    await mockDelay(null, 250);
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
    mockState.books.unshift(newBook);
    return newBook;
  }

  const response = await apiClient.post('/books', bookData);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    const index = mockState.books.findIndex((b) => b.id === id);
    if (index === -1) {
      const err = new Error('Book not found');
      err.response = { status: 404, data: { message: 'Book not found' } };
      throw err;
    }
    const updated = {
      ...mockState.books[index],
      ...bookData,
      id: mockState.books[index].id,
      totalCopies: bookData.totalCopies !== undefined ? Number(bookData.totalCopies) : mockState.books[index].totalCopies,
      availableCopies: bookData.availableCopies !== undefined ? Number(bookData.availableCopies) : mockState.books[index].availableCopies
    };
    mockState.books[index] = updated;
    return updated;
  }

  const response = await apiClient.put(`/books/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    const index = mockState.books.findIndex((b) => b.id === id);
    if (index === -1) {
      const err = new Error('Book not found');
      err.response = { status: 404, data: { message: 'Book not found' } };
      throw err;
    }
    mockState.books.splice(index, 1);
    return { message: 'Book deleted successfully' };
  }

  const response = await apiClient.delete(`/books/${id}`);
  return response.data;
};
