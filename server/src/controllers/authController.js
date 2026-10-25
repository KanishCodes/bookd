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
 * POST /api/auth/register
 *   Body: { name, email, password, role, department }
 *   Response: { token, user: { id, name, email, role, memberId } }
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

    const cleanEmail = email.trim().toLowerCase();

    // Lookup against seed users directly or through friendly alias
    let user = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      if (cleanEmail === 'kanish@bookd.test' || cleanEmail === 'kanish') {
        user = INITIAL_USERS.find(u => u.email === 'member@bookd.test');
      } else if (cleanEmail === 'naisha@bookd.test' || cleanEmail === 'naisha') {
        user = INITIAL_USERS.find(u => u.email === 'librarian@bookd.test');
      } else if (cleanEmail === 'patel@bookd.test' || cleanEmail === 'patel') {
        user = INITIAL_USERS.find(u => u.email === 'admin@bookd.test');
      }
    }
    
    // For demo/eval purposes, password is 'demo1234' or 'password'
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

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'member', department = 'General Studies' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: role.toLowerCase(),
      memberId: `${role.toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      department: department.trim(),
      activeIssuesCount: 0,
      totalFines: 0
    };

    INITIAL_USERS.push(newUser);
    const mockToken = `mock-jwt-token-for-${newUser.role}-${newUser.id}`;

    res.status(201).json({
      token: mockToken,
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    // TODO: Naisha - retrieve user from req.user (populated by authenticate middleware)
    const user = INITIAL_USERS[0]; // Kanish Sharma
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch user profile' });
  }
};
