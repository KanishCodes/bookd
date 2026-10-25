import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register
router.post('/register', register);

// GET /api/auth/me (requires auth)
router.get('/me', authenticate, getMe);

export default router;
