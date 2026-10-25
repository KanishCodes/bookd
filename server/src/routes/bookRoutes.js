import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const staff = [authenticate, requireRole(['librarian', 'admin'])];

// Public / member accessible
router.get('/', getBooks);
router.get('/:id', getBookById);

// Staff only
router.post('/', ...staff, createBook);
router.put('/:id', ...staff, updateBook);
router.delete('/:id', ...staff, deleteBook);

export default router;