import { INITIAL_REPORTS } from '../data/seedData.js';
import { issueRepository } from '../repositories/issueRepository.js';

/**
 * ============================================================================
 * TODO: NAISHA - Reports Controller (Admin analytics)
 * ============================================================================
 * Endpoints:
 * - GET /api/reports/overdue
 * - GET /api/reports/popular
 * - GET /api/reports/fines
 */

export const getOverdueReport = async (req, res) => {
  try {
    const overdueIssues = await issueRepository.getAll({ status: 'OVERDUE' });
    res.json({
      count: overdueIssues.length,
      records: overdueIssues
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch overdue report' });
  }
};

export const getPopularBooks = async (req, res) => {
  try {
    res.json(INITIAL_REPORTS.mostIssuedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch popular books report' });
  }
};

export const getFinesReport = async (req, res) => {
  try {
    const allIssues = await issueRepository.getAll();
    const overdueIssues = allIssues.filter(iss => iss.status === 'OVERDUE');
    const totalPending = overdueIssues.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);

    res.json({
      totalCollected: INITIAL_REPORTS.summary.totalFinesCollected,
      totalPending,
      overdueCount: overdueIssues.length,
      monthlyBreakdown: INITIAL_REPORTS.monthlyCirculation
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch fines report' });
  }
};
