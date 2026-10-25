import { bookRepository } from '../repositories/bookRepository.js';

export const getBooks = async (req, res) => {
  try {
    const { search, category, available } = req.query;
    const books = await bookRepository.getAll({ search, category, available });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching books' });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await bookRepository.getById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching book' });
  }
};

export const createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, availableCopies, shelfLocation, publicationYear, pages, description } = req.body;
    if (!title || !author || !isbn) {
      return res.status(400).json({ message: 'Title, author, and ISBN are required' });
    }
    const newBook = await bookRepository.create({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
      shelfLocation,
      publicationYear,
      pages,
      description
    });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating book' });
  }
};

export const updateBook = async (req, res) => {
  try {
    const updated = await bookRepository.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating book' });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const success = await bookRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting book' });
  }
};
