import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

export const getFines = async (userId) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    if (!userId) {
      return [...mockState.fines];
    }
    return mockState.fines.filter((f) => f.userId === userId);
  }

  const res = await apiClient.get('/fines', { params: { userId } });
  return res.data;
};

export const payFine = async (fineId, paymentDetails = {}) => {
  if (isMockMode()) {
    await mockDelay(null, 300);
    const index = mockState.fines.findIndex((f) => f.id === fineId);
    let paidAmount = 0;
    if (index !== -1) {
      paidAmount = mockState.fines[index].amount;
      const user = mockState.users.find((u) => u.id === mockState.fines[index].userId);
      if (user) {
        user.totalFines = Math.max(0, (user.totalFines || 0) - paidAmount);
      }
      mockState.fines.splice(index, 1);
    }
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      paidAmount,
      paidAt: new Date().toISOString()
    };
  }

  const res = await apiClient.post(`/fines/${fineId}/pay`, paymentDetails);
  return res.data;
};
