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

  // Combined endpoint or fallback in live mode
  const [popular, fines] = await Promise.all([
    getPopularBooksReport(),
    getFinesReport()
  ]);

  return {
    summary: {
      totalBooks: 32,
      totalCopies: 138,
      activeLoans: 8,
      overdueLoans: fines.overdueCount || 4,
      totalMembers: 16,
      totalFinesCollected: fines.totalCollected || 1420,
      pendingFines: fines.totalPending || 265
    },
    mostIssuedBooks: popular,
    monthlyCirculation: fines.monthlyBreakdown || [],
    categoryDistribution: mockState.reports.categoryDistribution,
    overdueMembers: mockState.reports.overdueMembers
  };
};
