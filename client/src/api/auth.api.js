import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

/**
 * Authentication API Service
 * Contract:
 * - POST /api/auth/login    -> { token, user: { id, name, email, role, memberId } }
 * - POST /api/auth/register -> { token, user: { id, name, email, role, memberId } }
 * - GET  /api/auth/me       -> { user }
 */

export const login = async ({ email, password }) => {
  if (isMockMode()) {
    await mockDelay(null, 250);

    const cleanEmail = email.trim().toLowerCase();

    // Find user directly or by friendly alias
    let user = mockState.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      if (cleanEmail === 'kanish@bookd.test' || cleanEmail === 'kanish') {
        user = mockState.users.find((u) => u.email === 'member@bookd.test');
      } else if (cleanEmail === 'naisha@bookd.test' || cleanEmail === 'naisha') {
        user = mockState.users.find((u) => u.email === 'librarian@bookd.test');
      } else if (cleanEmail === 'patel@bookd.test' || cleanEmail === 'patel') {
        user = mockState.users.find((u) => u.email === 'admin@bookd.test');
      }
    }

    // Support demo password 'demo1234' or 'password'
    if (!user || (password !== 'demo1234' && password !== 'password')) {
      const err = new Error('Invalid email or password. Use demo1234.');
      err.response = { status: 401, data: { message: 'Invalid email or password. Use demo1234.' } };
      throw err;
    }

    const token = `mock-jwt-token-for-${user.role}-${user.id}`;
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId,
        department: user.department,
        totalFines: user.totalFines,
        activeIssuesCount: user.activeIssuesCount
      }
    };
  }

  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const register = async ({ name, email, password, role = 'member', department = 'General Studies' }) => {
  if (isMockMode()) {
    await mockDelay(null, 250);

    const cleanEmail = email.trim().toLowerCase();
    const existing = mockState.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const err = new Error('An account with this institutional email already exists.');
      err.response = { status: 400, data: { message: 'Email already registered.' } };
      throw err;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: role.toLowerCase(),
      memberId: `${role.toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      department: department.trim(),
      activeIssuesCount: 0,
      totalFines: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    mockState.users.push(newUser);
    const token = `mock-jwt-token-for-${newUser.role}-${newUser.id}`;

    return {
      token,
      user: newUser
    };
  }

  const response = await apiClient.post('/auth/register', { name, email, password, role, department });
  return response.data;
};

export const getMe = async () => {
  if (isMockMode()) {
    await mockDelay(null, 150);
    const storedUserStr = localStorage.getItem('bookd_user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        const liveUser = mockState.users.find((u) => u.id === storedUser.id) || storedUser;
        return { user: liveUser };
      } catch (e) {
        // Fallback
      }
    }
    return { user: mockState.users[0] };
  }

  const response = await apiClient.get('/auth/me');
  return response.data;
};
