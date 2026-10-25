import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

/**
 * Authentication API Service
 * Contract:
 * - POST /api/auth/login -> { token, user: { id, name, email, role, memberId } }
 * - GET  /api/auth/me    -> { user }
 */

export const login = async ({ email, password }) => {
  if (isMockMode()) {
    await mockDelay(null, 250);

    const user = mockState.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    // Support demo password 'demo1234'
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
        // Fallback to first demo member
      }
    }
    return { user: mockState.users[0] };
  }

  const response = await apiClient.get('/auth/me');
  return response.data;
};
