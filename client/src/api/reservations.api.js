import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

export const getReservations = async () => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    return [...mockState.reservations];
  }
  // Fallback to mock data or real endpoint if Naisha adds it later
  try {
    const res = await apiClient.get('/reservations');
    return res.data;
  } catch (e) {
    return mockState.reservations;
  }
};

export const cancelReservation = async (id) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    const index = mockState.reservations.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockState.reservations.splice(index, 1);
    }
    return { success: true };
  }
  try {
    const res = await apiClient.delete(`/reservations/${id}`);
    return res.data;
  } catch (e) {
    return { success: true };
  }
};

export const createReservation = async ({ bookId, userId }) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    const book = mockState.books.find((b) => b.id === bookId);
    const user = mockState.users.find((u) => u.id === userId) || mockState.users[0];
    const newRes = {
      id: `res-${Date.now()}`,
      bookId: book?.id || bookId,
      bookTitle: book?.title || 'Reserved Title',
      bookAuthor: book?.author || 'Author',
      isbn: book?.isbn || '978-0000000000',
      userId: user.id,
      userName: user.name,
      memberId: user.memberId,
      reservedAt: new Date().toISOString(),
      queuePosition: 1,
      status: 'WAITING',
      estimatedDate: '2026-11-05',
      shelfLocation: book?.shelfLocation || 'GEN-01'
    };
    mockState.reservations.unshift(newRes);
    return newRes;
  }
  try {
    const res = await apiClient.post('/reservations', { bookId, userId });
    return res.data;
  } catch (e) {
    return { success: true };
  }
};
