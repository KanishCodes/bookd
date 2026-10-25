import { authenticate, requireRole } from '../middleware/auth.js';
import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';

const router = Router();

// Public / Member accessible
router.get('/', getBooks);
router.get('/:id', getBookById);

// Staff accessible (TODO for Naisha: attach authenticate + requireRole(['librarian', 'admin']) middleware)
const staff = [authenticate, requireRole(['librarian', 'admin'])];
router.post('/', ...staff, createBook);
router.put('/:id', ...staff, updateBook);
router.delete('/:id', ...staff, deleteBook);

export default router;
