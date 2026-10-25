import { INITIAL_USERS } from '../data/seedData.js';

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
 * GET /api/auth/me
 *   Header: Authorization: Bearer <token>
 *   Response: { user: { id, name, email, role, memberId, department, phone, activeIssuesCount, totalFines } }
 */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Demo lookup against seed data
    const user = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // For demo/eval purposes, password is 'demo1234'
    if (!user || (password !== 'demo1234' && password !== 'password')) {
      return res.status(401).json({ message: 'Invalid credentials. Use demo1234.' });
    }

    // TODO: Naisha - sign real JWT: jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const mockToken = `mock-jwt-token-for-${user.role}-${user.id}`;

    res.json({
      token: mockToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    // TODO: Naisha - retrieve user from req.user (populated by authenticate middleware)
    // For now fallback to member user or decoded token
    const user = INITIAL_USERS[0]; // Kanish Sharma
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch user profile' });
  }
};
