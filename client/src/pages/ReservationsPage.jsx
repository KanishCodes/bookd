import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getReservations, cancelReservation } from '../api/reservations.api.js';
import { StatusBadge } from '../components/Badge.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/FeedbackStates.jsx';
import {
  BookmarkCheck,
  Clock,
  Calendar,
  MapPin,
  Trash2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const ReservationsPage = () => {
  const { user, role } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const fetchRes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReservations();
      // If member, filter by their userId, else show all
      if (role === 'member') {
        const myRes = data.filter((r) => r.userId === user?.id || r.userId === 'u-1');
        setReservations(myRes);
      } else {
        setReservations(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    fetchRes();
  }, [fetchRes]);

  const handleCancel = async (id, title) => {
    if (window.confirm(`Cancel reservation hold on "${title}"?`)) {
      try {
        await cancelReservation(id);
        setNotification(`Cancelled hold for "${title}".`);
        setTimeout(() => setNotification(''), 4000);
        fetchRes();
      } catch (e) {
        alert(e.response?.data?.message || e.message || 'Failed to cancel reservation.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-venice-blue text-merino px-4 py-3 rounded shadow-elevated flex items-center gap-2 border border-rock-blue/40 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-rock-blue-light" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-sand flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Queue Priority & Title Holds
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-1 flex items-center gap-2.5">
            <BookmarkCheck className="w-8 h-8 text-venice-blue stroke-[2]" />
            <span>Circulation Holds & Reservations</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-medium">
            {role === 'member'
              ? 'Track your place in line for fully borrowed volumes and pick up notices.'
              : 'Institutional queue ledger across all stack volumes with pending patron reservations.'}
          </p>
        </div>

        <div className="bg-[#FEF8E7] border border-amber-200/90 rounded-2xl p-4 text-right shadow-sm">
          <span className="text-xs text-amber-900 uppercase tracking-wider font-bold block">
            Active Queue Holds
          </span>
          <div className="text-3xl font-extrabold text-amber-950 mt-1">
            {reservations.length}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState message="Auditing reservation waitlists..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRes} />
        ) : reservations.length === 0 ? (
          <EmptyState
            title="No active reservations"
            description="You do not have any titles reserved. When a book you desire is fully checked out, you can reserve it directly from the Catalogue."
            actionLabel="Browse Catalogue"
            onAction={() => (window.location.href = '/catalogue')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reservations.map((res) => {
              const isReady = res.status === 'READY_FOR_PICKUP';

              return (
                <div
                  key={res.id}
                  className={`bento-card rounded-3xl p-6 border flex flex-col justify-between transition-all shadow-bento hover:shadow-bento-hover ${
                    isReady ? 'border-sage/40 bg-sage/5' : 'border-sand hover:border-rock-blue/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-sand/70 mb-3.5">
                      <StatusBadge status={res.status} />
                      <span className="font-mono text-xs px-3 py-1 rounded-full bg-sand/60 text-venice-blue font-bold">
                        Position #{res.queuePosition}
                      </span>
                    </div>

                    <h3 className="font-bold text-ink text-base leading-snug">
                      {res.bookTitle}
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5 truncate font-medium">
                      {res.bookAuthor}
                    </p>

                    <div className="mt-4 p-3 rounded bg-merino border border-sand/60 space-y-2 text-xs">
                      {role !== 'member' && (
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted small-caps uppercase text-[10px]">Patron</span>
                          <span className="font-medium text-ink">{res.userName} ({res.memberId})</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted small-caps uppercase text-[10px]">Reserved On</span>
                        <span className="font-mono text-ink">
                          {new Date(res.reservedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted small-caps uppercase text-[10px]">Expected Intake</span>
                        <span className="font-mono font-semibold text-venice-blue">
                          {res.estimatedDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted small-caps uppercase text-[10px]">Stack Location</span>
                        <span className="font-mono text-ink flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rock-blue" />
                          {res.shelfLocation}
                        </span>
                      </div>
                    </div>

                    {isReady && (
                      <div className="mt-3 p-2 bg-sage/15 border border-sage/30 rounded text-xs text-sage font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Ready at the Front Circulation Desk! Pick up within 48 hours.</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-sand/70 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-ink-muted">
                      ID: {res.id}
                    </span>

                    <button
                      onClick={() => handleCancel(res.id, res.bookTitle)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs text-warm-red hover:bg-warm-red/10 rounded-full transition font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Hold</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
