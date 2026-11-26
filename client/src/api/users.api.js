import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

/**
 * Users API Service
 * Contract:
 * - GET /api/users?role=&search= -> [{ id, name, email, role, memberId, department, ... }]
 *   (librarian/admin only)
 */

export const getUsers = async ({ role = '', search = '' } = {}) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    let result = [...mockState.users];

    if (role && role.trim() !== '') {
      result = result.filter((u) => u.role === role.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.memberId || '').toLowerCase().includes(q)
      );
    }

    return result;
  }

  const response = await apiClient.get('/users', { params: { role, search } });
  // Accept both a bare array and { users: [...] } so backend shape can vary
  return Array.isArray(response.data) ? response.data : response.data.users || [];
};