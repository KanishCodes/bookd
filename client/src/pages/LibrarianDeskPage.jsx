import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllIssues, issueBook, returnBook, renewBook } from '../api/issues.api.js';
import { getBooks } from '../api/books.api.js';
import { MOCK_USERS } from '../mock/users.js';
import { StatusBadge } from '../components/Badge.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/FeedbackStates.jsx';
import {
  Library,
  BookDown,
  BookUp,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  User,
  Barcode
} from 'lucide-react';

export const LibrarianDeskPage = () => {
  const { role } = useAuth();

  // Circulation list state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED'
  const [tableSearch, setTableSearch] = useState('');

  // Fast Issue Form State
  const [booksList, setBooksList] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');

  // Quick Return Bar State
  const [returnIssueId, setReturnIssueId] = useState('');
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState('');

  // Toast feedback
  const [feedback, setFeedback] = useState(null);

  const fetchIssuesAndBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [issuesData, booksData] = await Promise.all([
        getAllIssues(),
        getBooks()
      ]);
      setIssues(issuesData);
      setBooksList(booksData);
      if (booksData.length > 0 && !selectedBookId) {
        const firstAvail = booksData.find((b) => b.availableCopies > 0);
        if (firstAvail) setSelectedBookId(firstAvail.id);
      }
      if (MOCK_USERS.length > 0 && !selectedUserId) {
        setSelectedUserId(MOCK_USERS[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load circulation records.');
    } finally {
      setLoading(false);
    }
  }, [selectedBookId, selectedUserId]);

  useEffect(() => {
    fetchIssuesAndBooks();
  }, [fetchIssuesAndBooks]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssueError('');

    if (!selectedBookId || !selectedUserId) {
      setIssueError('Please select both a title and a borrower.');
      return;
    }

    setIssuing(true);
    try {
      const created = await issueBook({
        bookId: selectedBookId,
        userId: selectedUserId
      });
      setFeedback({
        type: 'success',
        msg: `Successfully issued "${created.bookTitle}" to ${created.userName}. Due on ${new Date(created.dueAt).toLocaleDateString()}.`
      });
      setTimeout(() => setFeedback(null), 5000);
      fetchIssuesAndBooks();
    } catch (err) {
      setIssueError(err.response?.data?.message || err.message || 'Failed to issue volume.');
    } finally {
      setIssuing(false);
    }
  };

  const handleProcessReturn = async (issueId) => {
    const targetId = issueId || returnIssueId;
    if (!targetId) {
      setReturnError('Please select or specify an Issue Reference ID.');
      return;
    }

    setReturning(true);
    setReturnError('');
    try {
      const returned = await returnBook(targetId);
      setReturnIssueId('');
      setFeedback({
        type: 'success',
        msg: `Book returned successfully. ${returned.fineAmount > 0 ? `Settled overdue fine: ₹${returned.fineAmount}.` : 'No fines outstanding.'}`
      });
      setTimeout(() => setFeedback(null), 5000);
      fetchIssuesAndBooks();
    } catch (err) {
      setReturnError(err.response?.data?.message || err.message || 'Return processing failed.');
    } finally {
      setReturning(false);
    }
  };

  const handleQuickRenew = async (issueId) => {
    try {
      const renewed = await renewBook(issueId);
      setFeedback({
        type: 'success',
        msg: `Renewed loan #${renewed.id}. New due date: ${new Date(renewed.dueAt).toLocaleDateString()}.`
      });
      setTimeout(() => setFeedback(null), 4000);
      fetchIssuesAndBooks();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to renew book.');
    }
  };

  // Filter issues for table
  const filteredIssues = issues.filter((iss) => {
    if (activeFilter === 'ACTIVE' && (iss.returnedAt || iss.status === 'OVERDUE')) return false;
    if (activeFilter === 'OVERDUE' && iss.status !== 'OVERDUE') return false;
    if (activeFilter === 'RETURNED' && !iss.returnedAt) return false;

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      return (
        iss.bookTitle.toLowerCase().includes(q) ||
        iss.userName.toLowerCase().includes(q) ||
        iss.memberId.toLowerCase().includes(q) ||
        iss.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeLoanCount = issues.filter((i) => !i.returnedAt).length;
  const overdueLoanCount = issues.filter((i) => i.status === 'OVERDUE').length;
  const returnedLoanCount = issues.filter((i) => !!i.returnedAt).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-venice-blue text-merino px-4 py-3 rounded shadow-elevated flex items-center gap-2 border border-rock-blue/40 text-sm animate-fade-in max-w-md">
          <CheckCircle2 className="w-5 h-5 text-rock-blue-light flex-shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Desk Header */}
      <div className="pb-6 border-b border-sand/70 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Circulation Services & Stack Control
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-1 flex items-center gap-2.5">
            <Library className="w-8 h-8 text-venice-blue stroke-[2]" />
            <span>Circulation Desk</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-medium">
            Fast counter tool for book checkouts, returns, renewal extensions, and patron loan tracking.
          </p>
        </div>

        {/* Counter Stats - Bento Chips */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#FEF8E7] border border-amber-200/90 text-right shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 block">
              On Loan
            </span>
            <span className="text-2xl font-extrabold text-amber-950 leading-tight">
              {activeLoanCount}
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#FDF2F8] border border-pink-200/90 text-right shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-warm-red block">
              Overdue
            </span>
            <span className="text-2xl font-extrabold text-warm-red leading-tight">
              {overdueLoanCount}
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#F0FDF4] border border-emerald-200/90 text-right shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-900 block">
              Returned
            </span>
            <span className="text-2xl font-extrabold text-emerald-950 leading-tight">
              {returnedLoanCount}
            </span>
          </div>
        </div>
      </div>

      {/* Fast Action Panels: Issue & Return Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Fast Issue Panel (8 Cols) */}
        <div className="lg:col-span-7 bento-card rounded-3xl p-6 border border-sand shadow-bento">
          <div className="flex items-center justify-between pb-3.5 border-b border-sand/70 mb-4">
            <div className="flex items-center gap-2">
              <BookDown className="w-5 h-5 text-venice-blue" />
              <h2 className="text-lg font-bold text-ink">
                Quick Issue Volume
              </h2>
            </div>
            <span className="text-xs text-ink-muted font-mono font-medium">
              Standard 14-day duration
            </span>
          </div>

          {issueError && (
            <div className="mb-3 p-3 bg-warm-red/10 border border-warm-red/25 rounded-2xl text-warm-red text-xs font-semibold">
              {issueError}
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted mb-1">
                  Select Book Title
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink focus:outline-none focus:border-venice-blue"
                >
                  {booksList.map((book) => (
                    <option
                      key={book.id}
                      value={book.id}
                      disabled={book.availableCopies === 0}
                    >
                      {book.title} ({book.availableCopies}/{book.totalCopies} avail)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted mb-1">
                  Borrower Member Card
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink focus:outline-none focus:border-venice-blue"
                >
                  {MOCK_USERS.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.name} — {usr.memberId} ({usr.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-ink-muted italic">
                Borrower account will be verified and charged on return if overdue.
              </span>

              <button
                type="submit"
                disabled={issuing}
                className="px-5 py-2.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full text-xs uppercase tracking-wider font-bold transition shadow-bento flex items-center gap-2 disabled:opacity-50"
              >
                {issuing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-merino border-t-transparent rounded-full animate-spin" />
                    <span>Processing Loan...</span>
                  </>
                ) : (
                  <>
                    <BookDown className="w-4 h-4" />
                    <span>Issue Book</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Return by Scan / ID (5 Cols) */}
        <div className="lg:col-span-5 bento-card rounded-3xl p-6 border border-sand shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-sand/70 mb-4">
              <div className="flex items-center gap-2">
                <BookUp className="w-5 h-5 text-venice-blue" />
                <h2 className="text-lg font-bold text-ink">
                  Quick Return Intake
                </h2>
              </div>
              <span className="text-xs text-ink-muted font-mono font-medium">
                Scan or Select
              </span>
            </div>

            {returnError && (
              <div className="mb-3 p-3 bg-warm-red/10 border border-warm-red/25 rounded-2xl text-warm-red text-xs font-semibold">
                {returnError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-1.5">
                  Active Loan Issue Reference
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={returnIssueId}
                    onChange={(e) => setReturnIssueId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-merino-light border border-sand rounded-xl text-xs text-ink focus:outline-none focus:border-venice-blue font-medium"
                  >
                    <option value="">— Select active loan to return —</option>
                    {issues
                      .filter((iss) => !iss.returnedAt)
                      .map((iss) => (
                        <option key={iss.id} value={iss.id}>
                          #{iss.id} : {iss.bookTitle} ({iss.userName})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sand/70 mt-4 flex items-center justify-between">
            <span className="text-xs text-ink-muted font-medium">
              Auto-calculates fine if overdue.
            </span>
            <button
              onClick={() => handleProcessReturn(returnIssueId)}
              disabled={returning || !returnIssueId}
              className="px-5 py-2.5 bg-sand hover:bg-sand-dark text-ink border border-sand-dark rounded-full text-xs uppercase tracking-wider font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {returning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <BookUp className="w-4 h-4" />
                  <span>Process Return</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Circulation Register / Master Table */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
              Master Circulation Register
            </h2>
            <p className="text-xs text-ink-muted font-medium mt-0.5">
              Dense view of all physical volumes, borrowers, due dates, and fine liabilities.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter circulation..."
                className="pl-8 pr-3 py-1.5 bg-merino-light border border-sand rounded text-xs text-ink focus:outline-none focus:border-venice-blue w-48"
              />
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded border border-sand bg-merino-light p-0.5 text-xs">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded transition ${
                  activeFilter === 'ALL'
                    ? 'bg-venice-blue text-merino font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded transition ${
                  activeFilter === 'ACTIVE'
                    ? 'bg-venice-blue text-merino font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('OVERDUE')}
                className={`px-2.5 py-1 rounded transition ${
                  activeFilter === 'OVERDUE'
                    ? 'bg-warm-red text-merino font-medium'
                    : 'text-warm-red hover:bg-warm-red/10'
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setActiveFilter('RETURNED')}
                className={`px-2.5 py-1 rounded transition ${
                  activeFilter === 'RETURNED'
                    ? 'bg-venice-blue text-merino font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Returned
              </button>
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="mt-4 bg-merino-light rounded-3xl overflow-hidden border border-sand shadow-bento">
          {loading ? (
            <LoadingState message="Synchronizing circulation stack..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchIssuesAndBooks} />
          ) : filteredIssues.length === 0 ? (
            <EmptyState
              title="No circulation entries"
              description="No issue records match the selected filter criteria."
              actionLabel="Show All Records"
              onAction={() => {
                setActiveFilter('ALL');
                setTableSearch('');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-sand/40 border-b border-sand font-bold uppercase tracking-wider text-ink-muted">
                    <th className="py-3 px-4">Issue Ref</th>
                    <th className="py-3 px-4">Title & Volume</th>
                    <th className="py-3 px-4">Borrower (Card)</th>
                    <th className="py-3 px-4">Issued</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status / Fine</th>
                    <th className="py-3 px-4 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {filteredIssues.map((iss) => {
                    const isOverdue = iss.status === 'OVERDUE';
                    const isReturned = !!iss.returnedAt;

                    return (
                      <tr
                        key={iss.id}
                        className={`hover:bg-sand/20 transition ${
                          isOverdue ? 'bg-warm-red/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-muted font-bold">
                          {iss.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink text-xs">
                            {iss.bookTitle}
                          </div>
                          <div className="text-[10px] text-ink-muted truncate font-medium">
                            {iss.bookAuthor}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-ink">
                            {iss.userName}
                          </div>
                          <div className="font-mono text-[10px] text-ink-muted">
                            {iss.memberId}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-muted font-medium">
                          {new Date(iss.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className={isOverdue ? 'font-bold text-warm-red' : 'text-ink font-medium'}>
                            {new Date(iss.dueAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={iss.status} fineAmount={iss.fineAmount} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {!isReturned && (
                            <>
                              <button
                                onClick={() => handleQuickRenew(iss.id)}
                                disabled={(iss.renewCount || 0) >= 2}
                                className="px-3 py-1 bg-merino-light border border-sand hover:bg-sand text-ink rounded-full text-[11px] font-semibold transition disabled:opacity-40"
                                title="Extend due date +14 days"
                              >
                                Renew ({(iss.renewCount || 0)}/2)
                              </button>
                              <button
                                onClick={() => handleProcessReturn(iss.id)}
                                className="px-3.5 py-1 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full text-[11px] font-bold transition shadow-sm"
                                title="Process volume return"
                              >
                                Return
                              </button>
                            </>
                          )}
                          {isReturned && (
                            <span className="text-[11px] text-ink-muted font-mono font-medium">
                              Closed on {new Date(iss.returnedAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarianDeskPage;
