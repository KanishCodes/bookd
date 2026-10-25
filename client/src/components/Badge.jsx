import React from 'react';

export const StatusBadge = ({ status, fineAmount = 0 }) => {
  const norm = (status || '').toUpperCase();

  if (norm === 'OVERDUE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warm-red/15 text-warm-red border border-warm-red/30">
        <span className="w-1.5 h-1.5 rounded-full bg-warm-red animate-pulse" />
        Overdue {fineAmount > 0 ? `(₹${fineAmount})` : ''}
      </span>
    );
  }

  if (norm === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-venice-blue/10 text-venice-blue border border-venice-blue/20">
        <span className="w-1.5 h-1.5 rounded-full bg-venice-blue" />
        Active Loan
      </span>
    );
  }

  if (norm === 'RETURNED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sand/50 text-ink-muted border border-sand">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/50" />
        Returned
      </span>
    );
  }

  if (norm === 'WAITING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-900 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        In Queue
      </span>
    );
  }

  if (norm === 'READY_FOR_PICKUP') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sage/15 text-sage border border-sage/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        Ready for Pickup
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sand/30 text-ink-muted border border-sand">
      {status}
    </span>
  );
};

export const AvailabilityBadge = ({ availableCopies, totalCopies }) => {
  if (availableCopies > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sage/15 text-sage border border-sage/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        {availableCopies} of {totalCopies} available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ink-muted/10 text-ink-muted border border-ink-muted/20">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/60" />
      0 of {totalCopies} available
    </span>
  );
};

export const CategoryTag = ({ category, onClick, active = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
        active
          ? 'bg-venice-blue text-merino-light shadow-sm scale-105'
          : 'bg-merino-light text-ink-muted hover:text-ink hover:bg-sand/60 border border-sand'
      }`}
    >
      {category}
    </button>
  );
};
