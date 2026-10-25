import { Router } from 'express';
import {
  issueBook,
  returnBook,
  renewBook,
  getMyIssues,
  getAllIssues
} from '../controllers/issueController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Member loans
router.get('/mine', authenticate, getMyIssues);

// Librarian & Admin circulation
router.get('/', authenticate, requireRole(['librarian', 'admin']), getAllIssues);
router.post('/', authenticate, requireRole(['librarian', 'admin']), issueBook);
router.patch('/:id/return', authenticate, requireRole(['librarian', 'admin']), returnBook);
router.patch('/:id/renew', authenticate, renewBook);

export default router;
