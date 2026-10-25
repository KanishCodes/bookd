import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

/**
 * Reports API Service (Admin Analytics)
 * Contract:
 * - GET /api/reports/overdue
 * - GET /api/reports/popular
 * - GET /api/reports/fines
 */

export const getOverdueReport = async () => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    const overdue = mockState.issues.filter((iss) => iss.status === 'OVERDUE');
    return {
      count: overdue.length,
      records: overdue
    };
  }

  const response = await apiClient.get('/reports/overdue');
  return response.data;
};

export const getPopularBooksReport = async () => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    return mockState.reports.mostIssuedBooks;
  }

  const response = await apiClient.get('/reports/popular');
  return response.data;
};

export const getFinesReport = async () => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    const overdueIssues = mockState.issues.filter((iss) => iss.status === 'OVERDUE');
    const totalPending = overdueIssues.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);
    return {
      totalCollected: mockState.reports.summary.totalFinesCollected,
      totalPending,
      overdueCount: overdueIssues.length,
      monthlyBreakdown: mockState.reports.monthlyCirculation
    };
  }

  const response = await apiClient.get('/reports/fines');
  return response.data;
};

export const getReportsSummary = async () => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    return {
      summary: mockState.reports.summary,
      mostIssuedBooks: mockState.reports.mostIssuedBooks,
      monthlyCirculation: mockState.reports.monthlyCirculation,
      categoryDistribution: mockState.reports.categoryDistribution,
      overdueMembers: mockState.reports.overdueMembers
    };
  }

  // Live mode: everything comes from the server, nothing is taken from mock data
  const [popular, fines, extra] = await Promise.all([
    getPopularBooksReport(),
    getFinesReport(),
    apiClient.get('/reports/summary').then((r) => r.data)
  ]);

  return {
    summary: {
      ...extra.summary,
      overdueLoans: fines.overdueCount,
      totalFinesCollected: fines.totalCollected,
      pendingFines: fines.totalPending
    },
    mostIssuedBooks: popular,
    monthlyCirculation: fines.monthlyBreakdown || [],
    categoryDistribution: extra.categoryDistribution,
    overdueMembers: extra.overdueMembers
  };
};
