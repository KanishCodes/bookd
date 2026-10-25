import { issueRepository } from '../repositories/issueRepository.js';
import { bookRepository } from '../repositories/bookRepository.js';
import { INITIAL_USERS } from '../data/seedData.js';

/**
 * ============================================================================
 * TODO: NAISHA - Issue / Circulation Controller
 * ============================================================================
 * Endpoints:
 * - POST /api/issues            -> Issue a book (body: { bookId, userId })
 * - PATCH /api/issues/:id/return -> Return a book
 * - PATCH /api/issues/:id/renew  -> Renew loan (extends due date, limits to 2 times)
 * - GET /api/issues/mine         -> Authenticated user's loans
 * - GET /api/issues              -> All loans (librarian, admin)
 */

export const issueBook = async (req, res) => {
  try {
    const { bookId, userId } = req.body;
    if (!bookId || !userId) {
      return res.status(400).json({ message: 'bookId and userId are required' });
    }

    const book = await bookRepository.getById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No available copies for this title' });
    }

    const user = INITIAL_USERS.find(u => u.id === userId) || {
      id: userId,
      name: 'Library Member',
      email: 'member@univ.edu',
      memberId: 'MEM-GEN'
    };

    const newIssue = await issueRepository.createIssue({
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      memberId: user.memberId
    });

    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to issue book' });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const returned = await issueRepository.returnIssue(id);
    if (!returned) {
      return res.status(404).json({ message: 'Issue record not found' });
    }
    res.json(returned);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to process return' });
  }
};

export const renewBook = async (req, res) => {
  try {
    const { id } = req.params;
    const renewed = await issueRepository.renewIssue(id);
    if (!renewed) {
      return res.status(404).json({ message: 'Issue record not found' });
    }
    res.json(renewed);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to renew book' });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    // In scaffold/demo: default to Kanish (u-1) or req.user.id
    const userId = req.user?.id || 'u-1';
    const issues = await issueRepository.getAll({ userId });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch personal loans' });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const issues = await issueRepository.getAll({ status });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch circulation list' });
  }
};
