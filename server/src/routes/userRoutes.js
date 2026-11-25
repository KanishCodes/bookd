import { Router } from 'express';
import { getUsers } from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/users (librarian and admin only)
router.get('/', authenticate, requireRole(['librarian', 'admin']), getUsers);

export default router;
