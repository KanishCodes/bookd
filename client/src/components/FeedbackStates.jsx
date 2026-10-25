import React from 'react';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export const LoadingState = ({ message = 'Consulting the library archive...' }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="relative mb-4">
        <div className="w-10 h-10 border-2 border-rock-blue border-t-venice-blue rounded-full animate-spin" />
        <BookOpen className="w-4 h-4 text-venice-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-venice-blue text-sm font-semibold tracking-wide">
        {message}
      </p>
    </div>
  );
};

export const EmptyState = ({
  title = 'No records found',
  description = 'No items match your active filters or search criteria.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="bento-card rounded-3xl p-10 text-center max-w-md mx-auto my-8 shadow-bento">
      <div className="w-12 h-12 rounded-full bg-rock-blue/20 text-venice-blue flex items-center justify-center mx-auto mb-4 border border-sand">
        <BookOpen className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-extrabold text-ink mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-ink-muted mb-5 leading-relaxed font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-venice-blue hover:bg-venice-blue-hover text-merino-light text-xs uppercase tracking-wider rounded-full transition shadow-sm font-bold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({
  message = 'An unexpected error occurred while communicating with the library desk.',
  onRetry
}) => {
  return (
    <div className="p-5 rounded-3xl bg-warm-red/10 border border-warm-red/25 max-w-lg mx-auto my-6 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 text-warm-red mb-2">
        <AlertCircle className="w-5 h-5" />
        <span className="font-bold text-sm">Library Service Notice</span>
      </div>
      <p className="text-xs text-ink-muted mb-3 font-medium">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-merino-light border border-warm-red/30 text-warm-red text-xs rounded-full hover:bg-merino transition font-bold shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};
