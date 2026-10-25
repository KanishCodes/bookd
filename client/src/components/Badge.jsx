import React from 'react';

export const StatusBadge = ({ status, fineAmount = 0 }) => {
  const norm = (status || '').toUpperCase();

  if (norm === 'OVERDUE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-warm-red/15 text-warm-red border border-warm-red/30">
        <span className="w-1.5 h-1.5 rounded-full bg-warm-red animate-pulse" />
        Overdue {fineAmount > 0 ? `(₹${fineAmount})` : ''}
      </span>
    );
  }

  if (norm === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-venice-blue/10 text-venice-blue border border-venice-blue/20">
        <span className="w-1.5 h-1.5 rounded-full bg-venice-blue" />
        Active Loan
      </span>
    );
  }

  if (norm === 'RETURNED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-sand/40 text-ink-muted border border-sand">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/50" />
        Returned
      </span>
    );
  }

  if (norm === 'WAITING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        In Queue
      </span>
    );
  }

  if (norm === 'READY_FOR_PICKUP') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-sage/15 text-sage border border-sage/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        Ready for Pickup
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sand/30 text-ink-muted border border-sand">
      {status}
    </span>
  );
};

export const AvailabilityBadge = ({ availableCopies, totalCopies }) => {
  if (availableCopies > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sage/15 text-sage border border-sage/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        {availableCopies} of {totalCopies} available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-ink-muted/10 text-ink-muted border border-ink-muted/20">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/60" />
      All borrowed (0/{totalCopies})
    </span>
  );
};

export const CategoryTag = ({ category, onClick, active = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 text-xs tracking-wider uppercase small-caps rounded transition-colors ${
        active
          ? 'bg-venice-blue text-merino-light font-medium'
          : 'bg-rock-blue/15 text-venice-blue hover:bg-rock-blue/30 border border-sand'
      }`}
    >
      {category}
    </button>
  );
};
