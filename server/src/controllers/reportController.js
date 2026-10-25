import { INITIAL_REPORTS } from '../data/seedData.js';
import { issueRepository } from '../repositories/issueRepository.js';
import { bookRepository } from '../repositories/bookRepository.js';
import { fineRepository } from '../repositories/fineRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { getOverdueDays } from '../utils/fines.js';
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
    const [books, issues] = await Promise.all([bookRepository.getAll(), issueRepository.getAll()]);
    const history = INITIAL_REPORTS.mostIssuedBooks;

    const ranked = books
      .map(b => {
        const t = b.title.toLowerCase();
        const past = history.find(h => t.includes(h.title.toLowerCase()) || h.title.toLowerCase().includes(t));
        const live = issues.filter(i => i.bookId === b.id).length;
        return { title: b.title, issues: (past?.issues || 0) + live, category: b.category };
      })
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 8);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch popular books report' });
  }
};

export const getFinesReport = async (req, res) => {
  try {
    const allIssues = await issueRepository.getAll();
    const overdueIssues = allIssues.filter(iss => iss.status === 'OVERDUE');
       const pendingFines = await fineRepository.getAll();
    const totalPending = pendingFines.reduce((acc, f) => acc + f.amount, 0);

    res.json({
      totalCollected: INITIAL_REPORTS.summary.totalFinesCollected + fineRepository.totalCollected(),
      totalPending,
      overdueCount: overdueIssues.length,
      monthlyBreakdown: INITIAL_REPORTS.monthlyCirculation
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch fines report' });
  }
};

// Extra (not in the original contract): live numbers for the admin dashboard cards,
// category donut and delinquent-loans table, so live mode never falls back to mock data.
export const getSummaryReport = async (req, res) => {
  try {
    const [books, issues, users, pendingFines] = await Promise.all([
      bookRepository.getAll(),
      issueRepository.getAll(),
      userRepository.getAll(),
      fineRepository.getAll()
    ]);
    const open = issues.filter(i => !i.returnedAt);
    const overdue = open.filter(i => i.status === 'OVERDUE');
    const bookById = new Map(books.map(b => [b.id, b]));

    const categories = new Map();
    for (const seed of INITIAL_REPORTS.categoryDistribution)
      categories.set(seed.name, { name: seed.name, count: 0, loans: seed.loans });
    for (const b of books) {
      const c = categories.get(b.category) || { name: b.category, count: 0, loans: 0 };
      c.count += 1;
      categories.set(b.category, c);
    }
    for (const i of issues) {
      const cat = bookById.get(i.bookId)?.category;
      if (cat && categories.has(cat)) categories.get(cat).loans += 1;
    }

    res.json({
      summary: {
        totalBooks: books.length,
        totalCopies: books.reduce((s, b) => s + b.totalCopies, 0),
        activeLoans: open.length,
        overdueLoans: overdue.length,
        totalMembers: users.length,
        totalFinesCollected: INITIAL_REPORTS.summary.totalFinesCollected + fineRepository.totalCollected(),
        pendingFines: pendingFines.reduce((s, f) => s + f.amount, 0)
      },
      categoryDistribution: [...categories.values()].filter(c => c.count > 0),
      overdueMembers: overdue
        .map(i => ({
          name: i.userName,
          memberId: i.memberId,
          book: i.bookTitle,
          overdueDays: getOverdueDays(i.dueAt, null),
          fine: i.fineAmount
        }))
        .sort((a, b) => b.overdueDays - a.overdueDays)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch summary report' });
  }
};
