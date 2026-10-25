import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const ForbiddenPage = ({ requiredRoles = [], userRole }) => {
  const { switchDemoRole } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="paper-card rounded-lg p-8 sm:p-12 max-w-lg w-full text-center shadow-card-subtle border border-sand">
        <div className="w-14 h-14 rounded-full bg-warm-red/10 border border-warm-red/30 text-warm-red flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7 stroke-[1.5]" />
        </div>

        <span className="text-xs uppercase tracking-wider font-mono text-warm-red font-bold">
          Error 403 • Restricted Archival Access
        </span>

        <h1 className="text-3xl font-extrabold text-ink tracking-tight mt-2 mb-3">
          Restricted Stack Area
        </h1>

        <p className="text-sm text-ink-muted leading-relaxed mb-6 font-medium">
          This division of the library circulation desk is reserved for authorized staff privileges.
          {requiredRoles.length > 0 && (
            <span className="block mt-2 font-mono text-xs text-ink bg-merino-light p-2.5 rounded-2xl border border-sand">
              Required Clearance: <strong>{requiredRoles.join(', ')}</strong> | Your Role: <strong className="text-warm-red">{userRole || 'visitor'}</strong>
            </span>
          )}
        </p>

        {/* Evaluation Shortcut: Instant Role Switch */}
        <div className="mb-6 p-4 bg-sand/40 rounded-2xl border border-sand text-xs text-left">
          <p className="text-venice-blue mb-2 font-bold">
            Evaluation Quick Switch:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => switchDemoRole('librarian')}
              className="flex-1 py-2 px-3 bg-merino-light hover:bg-sand border border-sand rounded-full text-ink font-bold text-[11px] transition shadow-sm"
            >
              Become Librarian
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className="flex-1 py-1.5 px-2 bg-merino-light hover:bg-sand border border-sand rounded text-ink font-medium text-[11px]"
            >
              Become Admin
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/catalogue"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded text-xs uppercase small-caps tracking-wider font-semibold transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Return to Public Catalogue</span>
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-sand bg-merino-light hover:bg-sand text-ink rounded text-xs uppercase small-caps tracking-wider font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Loans</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
