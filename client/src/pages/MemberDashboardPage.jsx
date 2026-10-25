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
      <div className="pb-6 border-b border-sand/70 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
              Member Circulation Ledger
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-sand/70 text-venice-blue font-bold">
              {user?.memberId || 'MEM-2024-001'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-1.5">
            Welcome, {user?.name || 'Reader'}
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-medium">
            Department of {user?.department || 'Academic Studies'} • Track your current loans, renewals, and history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-sand bg-merino-light hover:bg-sand text-venice-blue rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Catalogue</span>
          </Link>
          <Link
            to="/fines"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full text-xs font-bold uppercase tracking-wider transition shadow-bento"
          >
            <CreditCard className="w-4 h-4" />
            <span>Fines & Dues</span>
          </Link>
        </div>
      </div>

      {/* Bento Overview Stat Cards with soft colorful inspo palettes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Yellow Bento Card: Active Loans */}
        <div className="bg-[#FEF8E7] border border-amber-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Active Loans
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-950 mt-2 tracking-tight">
            {activeIssues.length}
          </div>
          <div className="text-xs text-amber-800/80 mt-1 font-medium">
            Limit: 5 volumes maximum
          </div>
        </div>

        {/* Pink Bento Card: Overdue Titles */}
        <div className="bg-[#FDF2F8] border border-pink-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-900">
              Overdue Titles
            </span>
            <div className="w-8 h-8 rounded-full bg-pink-200/80 text-pink-900 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold mt-2 tracking-tight ${overdueCount > 0 ? 'text-warm-red' : 'text-pink-950'}`}>
            {overdueCount}
          </div>
          <div className="text-xs text-pink-800/80 mt-1 font-medium">
            {overdueCount > 0 ? 'Fine accruing daily' : 'All loans on time'}
          </div>
        </div>

        {/* Purple Bento Card: Pending Fines */}
        <div className="bg-[#F5F2FE] border border-purple-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Pending Fines
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-200/80 text-purple-900 flex items-center justify-center font-bold text-xs">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold mt-2 tracking-tight ${totalFineAmount > 0 ? 'text-warm-red' : 'text-purple-950'}`}>
            ₹{totalFineAmount}
          </div>
          <div className="text-xs text-purple-800/80 mt-1 font-medium">
            Tariff: ₹5 / day overdue
          </div>
        </div>

        {/* Mint Bento Card: Member Standing */}
        <div className="bg-[#F0FDF4] border border-emerald-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Account Standing
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-2 tracking-tight flex items-center gap-1.5">
            <span>Good Standing</span>
          </div>
          <div className="text-xs text-emerald-800/80 mt-1 font-medium">
            Full borrowing privileges active
          </div>
        </div>
      </div>

      {/* Active Borrowed Books Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between pb-3 border-b border-sand">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
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
                    className={`bento-card rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                      isOverdue ? 'border-warm-red/40 bg-warm-red/5' : 'border-sand hover:border-rock-blue/50'
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
                          <span className="text-[11px] font-mono font-medium text-ink-muted">
                            Ref #{issue.id}
                          </span>
                        </div>

                        <h3 className="font-bold text-ink text-base leading-tight mt-2">
                          {issue.bookTitle}
                        </h3>
                        <p className="text-xs text-ink-muted mt-0.5 truncate font-medium">
                          {issue.bookAuthor}
                        </p>

                        {/* Dates grid */}
                        <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs font-mono bg-merino-light p-3 rounded-2xl border border-sand/70">
                          <div>
                            <span className="text-[10px] uppercase font-sans text-ink-muted block font-semibold tracking-wider">
                              Issued On
                            </span>
                            <span className="text-ink font-semibold">
                              {new Date(issue.issuedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-sans text-ink-muted block font-semibold tracking-wider">
                              Due Date
                            </span>
                            <span className={`font-bold ${isOverdue ? 'text-warm-red' : 'text-ink'}`}>
                              {dueDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Fine notice if overdue */}
                        {isOverdue && issue.fineAmount > 0 && (
                          <div className="mt-2.5 p-2.5 rounded-2xl bg-warm-red/10 border border-warm-red/20 text-xs text-warm-red flex items-center justify-between font-medium">
                            <span className="flex items-center gap-1.5 font-bold">
                              <AlertTriangle className="w-4 h-4" />
                              Fine accrued:
                            </span>
                            <span className="font-extrabold font-mono text-sm">
                              ₹{issue.fineAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer / Action */}
                    <div className="mt-5 pt-3.5 border-t border-sand/70 flex items-center justify-between">
                      <div className="text-xs text-ink-muted font-medium">
                        Renewals: <span className="font-bold text-ink">{issue.renewCount || 0}/2</span>
                      </div>

                      <button
                        onClick={() => handleRenew(issue.id)}
                        disabled={renewsLeft === 0 || actionLoading === issue.id}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition uppercase tracking-wider ${
                          renewsLeft > 0
                            ? 'bg-venice-blue hover:bg-venice-blue-hover text-merino shadow-sm'
                            : 'bg-sand/70 text-ink-muted cursor-not-allowed'
                        }`}
                      >
                        {actionLoading === issue.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-merino border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
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
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">
            Circulation History
          </h2>
          <p className="text-xs text-ink-muted font-medium mt-0.5">
            Archive of past returned books and cleared transactions.
          </p>
        </div>

        <div className="mt-4 bg-merino-light rounded-3xl overflow-hidden border border-sand shadow-bento">
          {returnedIssues.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-muted font-medium">
              No previous return records in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-sand/40 border-b border-sand text-xs font-bold uppercase tracking-wider text-ink-muted">
                    <th className="py-3.5 px-5">Title & Author</th>
                    <th className="py-3.5 px-5">Issue Date</th>
                    <th className="py-3.5 px-5">Due Date</th>
                    <th className="py-3.5 px-5">Returned Date</th>
                    <th className="py-3.5 px-5">Fine Settled</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {returnedIssues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-sand/20 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-ink">
                          {iss.bookTitle}
                        </div>
                        <div className="text-xs text-ink-muted font-medium">
                          {iss.bookAuthor}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-ink-muted">
                        {new Date(iss.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-ink-muted">
                        {new Date(iss.dueAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-ink font-medium">
                        {iss.returnedAt ? new Date(iss.returnedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-ink">
                        {iss.fineAmount > 0 ? `₹${iss.fineAmount}` : '₹0'}
                      </td>
                      <td className="py-3.5 px-5">
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
