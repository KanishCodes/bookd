import mongoose from 'mongoose';
import { INITIAL_REPORTS } from '../data/seedData.js';
import { issueRepository } from '../repositories/issueRepository.js';
import { bookRepository } from '../repositories/bookRepository.js';
import { fineRepository } from '../repositories/fineRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { IssueRecord } from '../models/IssueRecord.js';
import { Book } from '../models/Book.js';
import { User } from '../models/User.js';
import { getOverdueDays, calculateFine } from '../utils/fines.js';

export const getOverdueReport = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const now = new Date();
        const records = await IssueRecord.aggregate([
          {
            $match: {
              returnedAt: null,
              $or: [{ status: 'OVERDUE' }, { dueAt: { $lt: now } }],
            },
          },
          { $sort: { dueAt: 1 } },
        ]);

        if (records && records.length > 0) {
          const enriched = records.map((r) => {
            const dueAtStr = new Date(r.dueAt).toISOString();
            return {
              ...r,
              id: r.customId || r._id.toString(),
              status: 'OVERDUE',
              dueAt: dueAtStr,
              issuedAt: new Date(r.issuedAt).toISOString(),
              fineAmount: calculateFine(r.dueAt, null),
            };
          });

          return res.json({
            count: enriched.length,
            records: enriched,
          });
        }
      } catch (err) {
        console.warn('[ReportController] MongoDB overdue report fallback:', err.message);
      }
    }

    const overdueIssues = await issueRepository.getAll({ status: 'OVERDUE' });
    res.json({
      count: overdueIssues.length,
      records: overdueIssues,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch overdue report' });
  }
};

export const getPopularBooks = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        // Native MongoDB aggregation pipeline grouping by bookId with counts
        const aggregatedIssues = await IssueRecord.aggregate([
          {
            $group: {
              _id: '$bookId',
              liveIssues: { $sum: 1 },
              bookTitle: { $first: '$bookTitle' },
            },
          },
          {
            $lookup: {
              from: 'books',
              let: { bId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ['$customId', '$$bId'] },
                        { $eq: [{ $toString: '$_id' }, '$$bId'] },
                      ],
                    },
                  },
                },
              ],
              as: 'bookInfo',
            },
          },
          {
            $unwind: {
              path: '$bookInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              bookId: '$_id',
              title: { $ifNull: ['$bookInfo.title', '$bookTitle'] },
              category: { $ifNull: ['$bookInfo.category', 'General'] },
              liveIssues: 1,
            },
          },
        ]);

        const books = await bookRepository.getAll();
        const history = INITIAL_REPORTS.mostIssuedBooks || [];
        const allIssues = await issueRepository.getAll();
        const issueMap = new Map();
        for (const item of aggregatedIssues) {
          issueMap.set(item.bookId, item.liveIssues);
        }

        const ranked = books
          .map((b) => {
            const t = b.title.toLowerCase();
            const past = history.find(
              (h) =>
                t.includes(h.title.toLowerCase()) ||
                h.title.toLowerCase().includes(t)
            );
            const dbLive = issueMap.get(b.id) || issueMap.get(b.customId) || 0;
            const memLive = allIssues.filter((i) => (i.bookId === b.id || i.bookId === b.customId) && i.status !== 'RETURNED').length;
            const live = Math.max(dbLive, memLive, (b.totalCopies - b.availableCopies) || 0);
            return {
              title: b.title,
              issues: (past?.issues || 0) + live,
              category: b.category,
            };
          })
          .sort((a, b) => b.issues - a.issues)
          .slice(0, 8);

        if (ranked.length > 0) {
          return res.json(ranked);
        }
      } catch (aggErr) {
        console.warn('[ReportController] Aggregation fallback to memory:', aggErr.message);
      }
    }

    // In-memory fallback
    const [books, issues] = await Promise.all([
      bookRepository.getAll(),
      issueRepository.getAll(),
    ]);
    const history = INITIAL_REPORTS.mostIssuedBooks;

    const ranked = books
      .map((b) => {
        const t = b.title.toLowerCase();
        const past = history.find(
          (h) =>
            t.includes(h.title.toLowerCase()) ||
            h.title.toLowerCase().includes(t)
        );
        const live = issues.filter((i) => i.bookId === b.id).length;
        return {
          title: b.title,
          issues: (past?.issues || 0) + live,
          category: b.category,
        };
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
    let overdueCount = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        const now = new Date();
        const [stats] = await IssueRecord.aggregate([
          {
            $facet: {
              overdue: [
                {
                  $match: {
                    returnedAt: null,
                    $or: [{ status: 'OVERDUE' }, { dueAt: { $lt: now } }],
                  },
                },
                { $count: 'total' },
              ],
            },
          },
        ]);
        overdueCount = stats?.overdue?.[0]?.total || 0;
      } catch (aggErr) {
        console.warn('[ReportController] MongoDB fines aggregation fallback:', aggErr.message);
      }
    }

    if (!overdueCount) {
      const allIssues = await issueRepository.getAll();
      const overdueIssues = allIssues.filter((iss) => iss.status === 'OVERDUE');
      overdueCount = overdueIssues.length;
    }

    const pendingFines = await fineRepository.getAll();
    const totalPending = pendingFines.reduce((acc, f) => acc + f.amount, 0);

    res.json({
      totalCollected: INITIAL_REPORTS.summary.totalFinesCollected + fineRepository.totalCollected(),
      totalPending,
      overdueCount,
      monthlyBreakdown: INITIAL_REPORTS.monthlyCirculation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch fines report' });
  }
};

// Extra: live numbers for the admin dashboard telemetry cards,
// category distribution donut chart and delinquent-borrower liabilities table.
export const getSummaryReport = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const now = new Date();
        const [bookStats, issueStats, userCount, pendingFines] = await Promise.all([
          Book.aggregate([
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalCopies: { $sum: '$totalCopies' },
              },
            },
          ]),
          IssueRecord.aggregate([
            {
              $facet: {
                active: [
                  { $match: { returnedAt: null } },
                  { $count: 'count' },
                ],
                overdue: [
                  {
                    $match: {
                      returnedAt: null,
                      $or: [{ status: 'OVERDUE' }, { dueAt: { $lt: now } }],
                    },
                  },
                  { $sort: { dueAt: 1 } },
                ],
                byCategory: [
                  {
                    $lookup: {
                      from: 'books',
                      let: { bId: '$bookId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $or: [
                                { $eq: ['$customId', '$$bId'] },
                                { $eq: [{ $toString: '$_id' }, '$$bId'] },
                              ],
                            },
                          },
                        },
                      ],
                      as: 'book',
                    },
                  },
                  { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
                  {
                    $group: {
                      _id: { $ifNull: ['$book.category', 'General'] },
                      loans: { $sum: 1 },
                    },
                  },
                ],
              },
            },
          ]),
          User.countDocuments({}),
          fineRepository.getAll(),
        ]);

        const totalBooks = bookStats.reduce((s, b) => s + b.count, 0);
        const totalCopies = bookStats.reduce((s, b) => s + b.totalCopies, 0);
        const activeLoans = issueStats?.[0]?.active?.[0]?.count || 0;
        const overdueRecords = issueStats?.[0]?.overdue || [];
        const loanMap = new Map();
        for (const item of issueStats?.[0]?.byCategory || []) {
          loanMap.set(item._id, item.loans);
        }

        const categories = new Map();
        for (const seed of INITIAL_REPORTS.categoryDistribution) {
          categories.set(seed.name, { name: seed.name, count: 0, loans: seed.loans });
        }
        for (const b of bookStats) {
          const categoryName = b._id || 'General';
          const c = categories.get(categoryName) || { name: categoryName, count: 0, loans: 0 };
          c.count += b.count;
          c.loans += (loanMap.get(categoryName) || 0);
          categories.set(categoryName, c);
        }

        if (totalBooks >= 30) {
          return res.json({
            summary: {
              totalBooks,
              totalCopies,
              activeLoans,
              overdueLoans: overdueRecords.length,
              totalMembers: userCount,
              totalFinesCollected: INITIAL_REPORTS.summary.totalFinesCollected + fineRepository.totalCollected(),
              pendingFines: pendingFines.reduce((s, f) => s + f.amount, 0),
            },
            categoryDistribution: [...categories.values()].filter((c) => c.count > 0),
            overdueMembers: overdueRecords
              .map((i) => ({
                name: i.userName,
                memberId: i.memberId,
                book: i.bookTitle,
                overdueDays: getOverdueDays(i.dueAt, null),
                fine: calculateFine(i.dueAt, null),
              }))
              .sort((a, b) => b.overdueDays - a.overdueDays),
          });
        }
      } catch (aggErr) {
        console.warn('[ReportController] MongoDB summary aggregation fallback:', aggErr.message);
      }
    }

    // In-memory fallback
    const [books, issues, users, pendingFines] = await Promise.all([
      bookRepository.getAll(),
      issueRepository.getAll(),
      userRepository.getAll(),
      fineRepository.getAll(),
    ]);
    const open = issues.filter((i) => !i.returnedAt);
    const overdue = open.filter((i) => i.status === 'OVERDUE');
    const bookById = new Map(books.map((b) => [b.id, b]));

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
        pendingFines: pendingFines.reduce((s, f) => s + f.amount, 0),
      },
      categoryDistribution: [...categories.values()].filter((c) => c.count > 0),
      overdueMembers: overdue
        .map((i) => ({
          name: i.userName,
          memberId: i.memberId,
          book: i.bookTitle,
          overdueDays: Math.max(1, getOverdueDays(i.dueAt, null)),
          fine: Math.max(5, i.fineAmount || calculateFine(i.dueAt, null)),
        }))
        .sort((a, b) => b.overdueDays - a.overdueDays),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch summary report' });
  }
};
