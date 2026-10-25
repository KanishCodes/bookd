import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyIssues, renewBook } from '../api/issues.api.js';
import { StatusBadge } from '../components/Badge.jsx';
import { BookCover } from '../components/BookCover.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/FeedbackStates.jsx';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookmarkCheck,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const MemberDashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyIssues();
      setIssues(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch personal loan records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleRenew = async (issueId) => {
    setActionLoading(issueId);
    try {
      const updated = await renewBook(issueId);
      setNotification(`Loan renewed! New due date: ${new Date(updated.dueAt).toLocaleDateString()}.`);
      setTimeout(() => setNotification(''), 4000);
      fetchLoans();
      refreshUser?.();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Renewal limit reached or book is restricted.');
    } finally {
      setActionLoading(null);
    }
  };

  // Split into active loans and returned history
  const activeIssues = issues.filter((iss) => !iss.returnedAt);
  const returnedIssues = issues.filter((iss) => !!iss.returnedAt);

  // Compute stats strictly from API issue records and user profile
  const overdueCount = activeIssues.filter((iss) => iss.status === 'OVERDUE').length;
  const totalFineAmount = activeIssues.reduce((sum, iss) => sum + (iss.fineAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-venice-blue text-merino px-4 py-3 rounded shadow-elevated flex items-center gap-2 border border-rock-blue/40 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-rock-blue-light" />
          <span>{notification}</span>
        </div>
      )}

      {/* Member Header & Status Strip */}
      <div className="pb-6 border-b border-sand flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest small-caps font-sans font-medium text-ink-muted">
              Member Circulation Ledger
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sand/60 text-venice-blue font-semibold">
              {user?.memberId || 'MEM-2024-001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight mt-1">
            Welcome, {user?.name || 'Reader'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Department of {user?.department || 'Academic Studies'} • Track your current loans, renewals, and history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-sand bg-merino-light hover:bg-sand text-venice-blue rounded text-xs uppercase small-caps font-semibold tracking-wider transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Catalogue</span>
          </Link>
          <Link
            to="/fines"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded text-xs uppercase small-caps font-semibold tracking-wider transition shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Fines & Dues</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="paper-card rounded-md p-4">
          <div className="text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted">
            Active Loans
          </div>
          <div className="font-serif text-2xl font-bold text-ink mt-1">
            {activeIssues.length}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Maximum allowance: 5 volumes
          </div>
        </div>

        <div className="paper-card rounded-md p-4">
          <div className="text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted">
            Overdue Titles
          </div>
          <div className={`font-serif text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-warm-red' : 'text-sage'}`}>
            {overdueCount}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            {overdueCount > 0 ? 'Return promptly to stop fine accrual' : 'No overdue titles'}
          </div>
        </div>

        <div className="paper-card rounded-md p-4">
          <div className="text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted">
            Pending Fines
          </div>
          <div className={`font-serif text-2xl font-bold mt-1 ${totalFineAmount > 0 ? 'text-warm-red' : 'text-ink'}`}>
            ₹{totalFineAmount}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Tariff: ₹5 / day overdue
          </div>
        </div>

        <div className="paper-card rounded-md p-4">
          <div className="text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted">
            Member Standing
          </div>
          <div className="font-serif text-2xl font-bold text-venice-blue mt-1 flex items-center gap-1.5">
            <UserCheck className="w-6 h-6 text-sage" />
            <span>Good</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Circulation privileges active
          </div>
        </div>
      </div>

      {/* Active Borrowed Books Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Currently on Loan
            </h2>
            <p className="text-xs text-ink-muted">
              Physical titles currently checked out under your card.
            </p>
          </div>
          <button
            onClick={fetchLoans}
            className="p-1.5 rounded hover:bg-sand text-ink-muted hover:text-ink transition"
            title="Refresh loan records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <LoadingState message="Retrieving personal circulation ledger..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchLoans} />
          ) : activeIssues.length === 0 ? (
            <EmptyState
              title="No active loans"
              description="You have returned all borrowed titles. Browse the catalogue to borrow your next read."
              actionLabel="Explore Catalogue"
              onAction={() => (window.location.href = '/catalogue')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeIssues.map((issue) => {
                const dueDate = new Date(issue.dueAt);
                const isOverdue = issue.status === 'OVERDUE';
                const renewsLeft = Math.max(0, 2 - (issue.renewCount || 0));

                return (
                  <div
                    key={issue.id}
                    className={`paper-card rounded-md p-5 border transition flex flex-col justify-between ${
                      isOverdue ? 'border-warm-red/40 bg-warm-red/5' : 'border-sand'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <BookCover
                        title={issue.bookTitle}
                        author={issue.bookAuthor}
                        category="Classic Literature"
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge
                            status={issue.status}
                            fineAmount={issue.fineAmount}
                          />
                          <span className="text-[10px] font-mono text-ink-muted">
                            Ref #{issue.id}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-ink text-base leading-tight mt-1.5">
                          {issue.bookTitle}
                        </h3>
                        <p className="text-xs text-ink-muted mt-0.5 truncate">
                          {issue.bookAuthor}
                        </p>

                        {/* Dates grid */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-merino p-2 rounded border border-sand/60">
                          <div>
                            <span className="text-[10px] uppercase font-sans text-ink-muted block small-caps">
                              Issued On
                            </span>
                            <span className="text-ink">
                              {new Date(issue.issuedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-sans text-ink-muted block small-caps">
                              Due Date
                            </span>
                            <span className={`font-semibold ${isOverdue ? 'text-warm-red' : 'text-ink'}`}>
                              {dueDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Fine notice if overdue */}
                        {isOverdue && issue.fineAmount > 0 && (
                          <div className="mt-2.5 p-2 rounded bg-warm-red/10 border border-warm-red/20 text-xs text-warm-red flex items-center justify-between">
                            <span className="flex items-center gap-1 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Fine accrued:
                            </span>
                            <span className="font-bold font-mono">
                              ₹{issue.fineAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer / Action */}
                    <div className="mt-4 pt-3 border-t border-sand/70 flex items-center justify-between">
                      <div className="text-xs text-ink-muted">
                        Renewals: <span className="font-semibold text-ink">{issue.renewCount || 0}/2</span>
                      </div>

                      <button
                        onClick={() => handleRenew(issue.id)}
                        disabled={renewsLeft === 0 || actionLoading === issue.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition uppercase small-caps tracking-wider ${
                          renewsLeft > 0
                            ? 'bg-venice-blue hover:bg-venice-blue-hover text-merino shadow-sm'
                            : 'bg-sand/60 text-ink-muted cursor-not-allowed'
                        }`}
                      >
                        {actionLoading === issue.id ? (
                          <div className="w-3 h-3 border-2 border-merino border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        <span>{renewsLeft > 0 ? 'Renew +14 Days' : 'Limit Reached'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Returned History Table */}
      <div className="mt-12">
        <div className="pb-3 border-b border-sand">
          <h2 className="font-serif text-xl font-bold text-ink">
            Circulation History
          </h2>
          <p className="text-xs text-ink-muted">
            Archive of past returned books and cleared transactions.
          </p>
        </div>

        <div className="mt-4 paper-card rounded-md overflow-hidden border border-sand">
          {returnedIssues.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-muted">
              No previous return records in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-sand/30 border-b border-sand text-xs font-sans small-caps uppercase tracking-wider text-ink-muted">
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Returned Date</th>
                    <th className="py-3 px-4">Fine Settled</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {returnedIssues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-sand/15 transition">
                      <td className="py-3 px-4">
                        <div className="font-serif font-semibold text-ink">
                          {iss.bookTitle}
                        </div>
                        <div className="text-xs text-ink-muted">
                          {iss.bookAuthor}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-muted">
                        {new Date(iss.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-muted">
                        {new Date(iss.dueAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink">
                        {iss.returnedAt ? new Date(iss.returnedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink">
                        {iss.fineAmount > 0 ? `₹${iss.fineAmount}` : '₹0'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="RETURNED" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardPage;
