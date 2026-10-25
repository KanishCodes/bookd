import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (requires auth)
router.get('/me', authenticate, getMe);

export default router;
