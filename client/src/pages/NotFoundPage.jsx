import React from 'react';
import { Link } from 'react-router-dom';
import { BookX, ArrowLeft, BookOpen } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="bento-card rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-bento border border-sand">
        <div className="w-14 h-14 rounded-full bg-sand/60 text-venice-blue flex items-center justify-center mx-auto mb-5 border border-sand">
          <BookX className="w-7 h-7 stroke-[2]" />
        </div>

        <span className="text-xs uppercase tracking-wider font-mono text-ink-muted font-bold">
          Error 404 • Missing Folio
        </span>

        <h1 className="text-3xl font-extrabold text-ink tracking-tight mt-2 mb-3">
          Catalogue Page Not Found
        </h1>

        <p className="text-sm text-ink-muted leading-relaxed mb-6 font-medium">
          The requested shelf location or archival record cannot be located in the current stack ledger. It may have been re-catalogued or retired.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full text-xs uppercase tracking-wider font-bold transition shadow-bento"
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
