import React from 'react';
import { Link } from 'react-router-dom';
import { BookX, ArrowLeft, BookOpen } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="paper-card rounded-lg p-8 sm:p-12 max-w-lg w-full text-center shadow-card-subtle border border-sand">
        <div className="w-14 h-14 rounded-full bg-sand/60 text-venice-blue flex items-center justify-center mx-auto mb-5 border border-sand">
          <BookX className="w-7 h-7 stroke-[1.5]" />
        </div>

        <span className="text-xs uppercase tracking-widest small-caps font-mono text-ink-muted font-semibold">
          Error 404 • Missing Folio
        </span>

        <h1 className="font-serif text-3xl font-bold text-ink tracking-tight mt-2 mb-3">
          Catalogue Page Not Found
        </h1>

        <p className="text-sm text-ink-muted leading-relaxed mb-6 font-sans">
          The requested shelf location or archival record cannot be located in the current stack ledger. It may have been re-catalogued or retired.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded text-xs uppercase small-caps tracking-wider font-semibold transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Return to Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
