

/**
 * ============================================================================
 * TODO: NAISHA - Authentication Controller
 * ============================================================================
 * Contract:
 * POST /api/auth/login
 *   Body: { email, password }
 *   Response: { token, user: { id, name, email, role, memberId } }
 *   Error: 401 { message: "Invalid email or password" }
 *
 * POST /api/auth/register
 *   Body: { name, email, password, role, department }
 *   Response: { token, user: { id, name, email, role, memberId } }
 *
 * GET /api/auth/me
 *   Header: Authorization: Bearer <token>
 *   Response: { user: { id, name, email, role, memberId, department, phone, activeIssuesCount, totalFines } }
 */
import { fineRepository } from '../repositories/fineRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, toPublicUser } from '../repositories/userRepository.js';
import { issueRepository } from '../repositories/issueRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bookd_super_secret_jwt_key_demo_evaluation';

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: signToken(user), user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Login failed' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (await userRepository.findByEmail(email))
      return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ name, email, passwordHash, department });
    res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Registration failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const loans = await issueRepository.getAll({ userId: user.id });
    const activeIssuesCount = loans.filter(l => l.status !== 'RETURNED').length;
        const fines = await fineRepository.getAll({ userId: user.id });
    const totalFines = fines.reduce((sum, f) => sum + f.amount, 0);
    res.json({ user: { ...toPublicUser(user), activeIssuesCount, totalFines } });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to fetch user profile' });
  }
};