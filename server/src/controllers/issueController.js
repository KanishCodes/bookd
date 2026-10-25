import { issueRepository } from '../repositories/issueRepository.js';
import { bookRepository } from '../repositories/bookRepository.js';
import { userRepository } from '../repositories/userRepository.js';

const MAX_ACTIVE_LOANS = 5;
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
    if (!bookId || !userId)
      return res.status(400).json({ message: 'bookId and userId are required' });

    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const book = await bookRepository.getById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.availableCopies <= 0)
      return res.status(400).json({ message: 'No available copies remaining for this title' });

    if (await issueRepository.hasActiveLoan(user.id, book.id))
      return res.status(400).json({ message: 'This member already has this book on loan' });

    if ((await issueRepository.countActiveLoans(user.id)) >= MAX_ACTIVE_LOANS)
      return res.status(400).json({ message: `Loan limit reached (${MAX_ACTIVE_LOANS} active loans)` });

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
    res.status(error.status || 500).json({ message: error.message || 'Failed to issue book' });
  }
};

export const returnBook = async (req, res) => {
  try {
    const returned = await issueRepository.returnIssue(req.params.id);
    if (!returned) return res.status(404).json({ message: 'Issue record not found' });
    res.json(returned);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to process return' });
  }
};

export const renewBook = async (req, res) => {
  try {
    const existing = await issueRepository.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Issue record not found' });

    const isStaff = ['librarian', 'admin'].includes(req.user.role);
    if (!isStaff && existing.userId !== req.user.id)
      return res.status(403).json({ message: 'You can only renew your own loans' });

    const renewed = await issueRepository.renewIssue(req.params.id);
    res.json(renewed);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || 'Failed to renew book' });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    // In scaffold/demo: default to Kanish (u-1) or req.user.id
    const userId = req.user.id;
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
