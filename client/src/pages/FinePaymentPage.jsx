import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getFines, payFine } from '../api/fines.api.js';
import { Modal } from '../components/Modal.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/FeedbackStates.jsx';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';

export const FinePaymentPage = () => {
  const { user, role, refreshUser } = useAuth();
  const isMember = role === 'member';

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal state
  const [payingFine, setPayingFine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'BURSARY'
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const fetchFinesList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // If member, only fetch their fines
      const userId = isMember ? (user?.id || 'u-1') : undefined;
      const data = await getFines(userId);
      setFines(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve dues records.');
    } finally {
      setLoading(false);
    }
  }, [isMember, user]);

  useEffect(() => {
    fetchFinesList();
  }, [fetchFinesList]);

  const handleOpenPay = (fine) => {
    setPayingFine(fine);
    setReceipt(null);
    setIsModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payingFine) return;

    setProcessing(true);
    try {
      const res = await payFine(payingFine.id, { method: paymentMethod });
      setReceipt({
        ...res,
        fine: payingFine
      });
      fetchFinesList();
      refreshUser?.();
    } catch (err) {
      alert('Payment processing error.');
    } finally {
      setProcessing(false);
    }
  };

  const totalOutstanding = fines.reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-sand flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest small-caps font-sans font-medium text-ink-muted">
            Financial Settlement & Stack Overdue Clearance
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight mt-1 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-venice-blue stroke-[1.5]" />
            <span>Circulation Dues & Fine Payment</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {isMember
              ? 'Clear accumulated overdue liabilities to preserve your library standing.'
              : 'Institutional fine register across all enrolled patrons and departments.'}
          </p>
        </div>

        <div className="paper-card rounded p-3 border border-sand text-right">
          <span className="text-xs text-ink-muted small-caps uppercase block">
            {isMember ? 'My Outstanding Dues' : 'Total Pending Collection'}
          </span>
          <div className={`font-serif text-2xl font-bold ${totalOutstanding > 0 ? 'text-warm-red' : 'text-sage'}`}>
            ₹{totalOutstanding}
          </div>
        </div>
      </div>

      {/* Main Fine List */}
      <div className="mt-8">
        {loading ? (
          <LoadingState message="Auditing institutional dues ledger..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchFinesList} />
        ) : fines.length === 0 ? (
          <EmptyState
            title="All accounts settled"
            description="There are no outstanding overdue fines on this ledger. Thank you for prompt returns!"
            actionLabel="Return to Catalogue"
            onAction={() => (window.location.href = '/catalogue')}
          />
        ) : (
          <div className="space-y-4">
            <div className="paper-card rounded-md overflow-hidden border border-sand">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-sand/30 border-b border-sand font-sans small-caps uppercase tracking-wider text-ink-muted">
                      <th className="py-3 px-4">Fine Reference</th>
                      <th className="py-3 px-4">Overdue Volume</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Days Overdue</th>
                      <th className="py-3 px-4">Rate Breakdown</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/50">
                    {fines.map((fine) => (
                      <tr key={fine.id} className="hover:bg-sand/15 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">
                          {fine.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-serif font-bold text-ink text-sm">
                            {fine.bookTitle}
                          </div>
                          <div className="text-[10px] font-mono text-ink-muted">
                            ISBN: {fine.isbn}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-ink-muted">
                          {fine.dueDate}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-warm-red">
                          +{fine.overdueDays} days
                        </td>
                        <td className="py-3 px-4 text-[11px] text-ink-muted">
                          {fine.overdueDays} days × ₹{fine.dailyRate}/day
                        </td>
                        <td className="py-3 px-4 font-mono text-sm font-bold text-warm-red">
                          ₹{fine.amount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenPay(fine)}
                            className="px-3 py-1.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded text-xs uppercase small-caps font-semibold tracking-wider transition shadow-sm"
                          >
                            Pay Dues
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Checkout Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={receipt ? 'Official Settlement Receipt' : 'Settle Library Fine'}
        subtitle={receipt ? 'Transaction successfully logged' : `Overdue Volume: ${payingFine?.bookTitle}`}
      >
        {receipt ? (
          /* Receipt View */
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-sage/15 text-sage flex items-center justify-center mx-auto border border-sage/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-ink">
                Fine Paid in Full
              </h4>
              <p className="text-xs text-ink-muted mt-1">
                Your borrowing record has been credited and updated.
              </p>
            </div>

            <div className="p-4 rounded bg-merino border border-sand text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Receipt Ref:</span>
                <span className="font-bold text-ink">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Amount Paid:</span>
                <span className="font-bold text-sage">₹{receipt.paidAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Timestamp:</span>
                <span className="text-ink">{new Date(receipt.paidAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Volume:</span>
                <span className="text-ink truncate max-w-[200px]">{receipt.fine?.bookTitle}</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 bg-venice-blue text-merino text-xs uppercase small-caps tracking-wider font-semibold rounded hover:bg-venice-blue-hover transition"
            >
              Done / Close
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleProcessPayment} className="space-y-4">
            <div className="p-3 bg-sand/40 rounded border border-sand flex items-center justify-between">
              <div>
                <span className="text-[10px] small-caps uppercase tracking-wider text-ink-muted block font-semibold">
                  Amount Due
                </span>
                <span className="font-serif text-2xl font-bold text-warm-red">
                  ₹{payingFine?.amount}
                </span>
              </div>
              <div className="text-right text-xs text-ink-muted">
                <div>Tariff: ₹5 / day</div>
                <div className="font-mono">({payingFine?.overdueDays} days past due)</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink small-caps uppercase tracking-wider mb-2">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded text-center border text-xs transition ${
                    paymentMethod === 'CARD'
                      ? 'bg-venice-blue text-merino border-venice-blue font-semibold'
                      : 'bg-merino-light border-sand text-ink hover:bg-sand'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded text-center border text-xs transition ${
                    paymentMethod === 'UPI'
                      ? 'bg-venice-blue text-merino border-venice-blue font-semibold'
                      : 'bg-merino-light border-sand text-ink hover:bg-sand'
                  }`}
                >
                  <Receipt className="w-4 h-4 mx-auto mb-1" />
                  <span>Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BURSARY')}
                  className={`p-2.5 rounded text-center border text-xs transition ${
                    paymentMethod === 'BURSARY'
                      ? 'bg-venice-blue text-merino border-venice-blue font-semibold'
                      : 'bg-merino-light border-sand text-ink hover:bg-sand'
                  }`}
                >
                  <Banknote className="w-4 h-4 mx-auto mb-1" />
                  <span>Student Card</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-sand flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 border border-sand text-ink-muted hover:text-ink text-xs rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 bg-venice-blue hover:bg-venice-blue-hover text-merino text-xs uppercase small-caps tracking-wider font-semibold rounded transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? 'Authorizing Payment...' : `Confirm & Pay ₹${payingFine?.amount}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FinePaymentPage;
