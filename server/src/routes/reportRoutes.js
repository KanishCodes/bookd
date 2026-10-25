import { Router } from 'express';
import {
  getOverdueReport,
  getPopularBooks,
  getFinesReport
} from '../controllers/reportController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin only analytics endpoints
router.get('/overdue', authenticate, requireRole(['admin']), getOverdueReport);
router.get('/popular', authenticate, requireRole(['admin']), getPopularBooks);
router.get('/fines', authenticate, requireRole(['admin']), getFinesReport);

export default router;
