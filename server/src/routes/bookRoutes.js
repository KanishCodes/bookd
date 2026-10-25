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
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;
