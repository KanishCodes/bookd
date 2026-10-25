import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BookCover } from '../components/BookCover.jsx';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Library,
  UserCheck,
  BarChart3,
  Sparkles,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';

const FEATURED_BOOKS = [
  {
    id: "b-102",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Computer Science",
    year: 2017,
    shelf: "CS-B2-11",
    copies: "3 of 5 available"
  },
  {
    id: "b-106",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Classic Literature",
    year: 1960,
    shelf: "LIT-A1-02",
    copies: "4 of 5 available"
  },
  {
    id: "b-111",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History & Philosophy",
    year: 2014,
    shelf: "HIST-A2-03",
    copies: "4 of 6 available"
  },
  {
    id: "b-123",
    title: "A Pattern Language",
    author: "Christopher Alexander et al.",
    category: "Art & Architecture",
    year: 1977,
    shelf: "ART-C2-22",
    copies: "0 of 2 available"
  }
];

export const LandingPage = () => {
  const { user, isAuthenticated, login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (demoEmail) => {
    try {
      await login(demoEmail, 'demo1234');
      navigate('/catalogue');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-merino selection:bg-rock-blue/30 selection:text-ink">
      {/* Editorial Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-sand overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-6 right-8 font-serif text-[180px] font-bold text-venice-blue/[0.03] select-none pointer-events-none leading-none">
          № 1
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand/60 border border-sand text-xs font-sans uppercase tracking-widest small-caps text-venice-blue font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central University Circulation & Archival Ledger</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-ink tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Curated Knowledge, <br />
            <span className="italic font-normal text-venice-blue">Timeless Volumes.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto font-sans leading-relaxed">
            Book’d is a role-governed library system. Explore 30+ physical stack volumes, check real-time copy availability, manage loans, and process circulation desk intakes.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded font-medium text-sm transition shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Catalogue (Logged in as {user?.name})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-sand bg-merino-light hover:bg-sand text-ink rounded font-medium text-sm transition"
                >
                  <UserCheck className="w-4 h-4 text-venice-blue" />
                  <span>My Loans Ledger</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded font-medium text-sm transition shadow-sm"
                >
                  <span>Sign In with Institutional Card</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-sand bg-merino-light hover:bg-sand text-ink rounded font-medium text-sm transition"
                >
                  <Search className="w-4 h-4 text-venice-blue" />
                  <span>Browse Public Stacks</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 1-Click Evaluation Demo Access Panel */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-sand bg-sand-light/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest small-caps font-mono text-venice-blue font-semibold">
              Evaluation Fast Access
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink mt-1">
              Test Instant Role-Based Profiles
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-lg mx-auto">
              Click any profile below to immediately log in and explore their role-specific dashboard and permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Member Card */}
            <div className="paper-card rounded-md p-5 border border-sand flex flex-col justify-between hover:border-rock-blue transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] small-caps uppercase tracking-wider px-2 py-0.5 rounded bg-rock-blue/20 text-venice-blue font-semibold">
                    Patron / Student
                  </span>
                  <UserCheck className="w-4 h-4 text-venice-blue" />
                </div>
                <h3 className="font-serif font-bold text-ink text-lg">
                  Library Member
                </h3>
                <p className="text-xs font-mono text-ink-muted">
                  member@bookd.test
                </p>
                <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
                  Borrow books, track active loans, view overdue days & fine amounts, and renew loans with 1 click (+14 days).
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin('member@bookd.test')}
                className="mt-4 w-full py-2 bg-merino-light border border-sand hover:bg-sand text-ink text-xs font-semibold uppercase small-caps tracking-wider rounded transition flex items-center justify-center gap-1.5"
              >
                <span>Log In as Member →</span>
              </button>
            </div>

            {/* Librarian Card */}
            <div className="paper-card rounded-md p-5 border border-sand flex flex-col justify-between hover:border-rock-blue transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] small-caps uppercase tracking-wider px-2 py-0.5 rounded bg-sage/20 text-sage font-semibold">
                    Staff Clearance
                  </span>
                  <Library className="w-4 h-4 text-sage" />
                </div>
                <h3 className="font-serif font-bold text-ink text-lg">
                  Desk Librarian
                </h3>
                <p className="text-xs font-mono text-ink-muted">
                  librarian@bookd.test
                </p>
                <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
                  High-density circulation desk, rapid checkout intake, return processing, active register, and book management.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin('librarian@bookd.test')}
                className="mt-4 w-full py-2 bg-venice-blue hover:bg-venice-blue-hover text-merino text-xs font-semibold uppercase small-caps tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Log In as Librarian →</span>
              </button>
            </div>

            {/* Admin Card */}
            <div className="paper-card rounded-md p-5 border border-sand flex flex-col justify-between hover:border-rock-blue transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] small-caps uppercase tracking-wider px-2 py-0.5 rounded bg-venice-blue/15 text-venice-blue font-semibold">
                    Executive Clearance
                  </span>
                  <BarChart3 className="w-4 h-4 text-venice-blue" />
                </div>
                <h3 className="font-serif font-bold text-ink text-lg">
                  Library Administrator
                </h3>
                <p className="text-xs font-mono text-ink-muted">
                  admin@bookd.test
                </p>
                <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
                  Circulation velocity analytics, Recharts telemetry, discipline distribution, overdue liabilities, and fine reports.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin('admin@bookd.test')}
                className="mt-4 w-full py-2 bg-merino-light border border-sand hover:bg-sand text-ink text-xs font-semibold uppercase small-caps tracking-wider rounded transition flex items-center justify-center gap-1.5"
              >
                <span>Log In as Admin →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured From The Archive */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-sand mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest small-caps font-sans font-medium text-ink-muted">
              Select Highlights
            </span>
            <h2 className="font-serif text-3xl font-bold text-ink tracking-tight mt-1">
              Featured Archival Volumes
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Handpicked essential monographs across technical and humanistic disciplines.
            </p>
          </div>

          <Link
            to="/catalogue"
            className="text-xs font-semibold uppercase small-caps tracking-wider text-venice-blue hover:underline flex items-center gap-1"
          >
            <span>View All 32 Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_BOOKS.map((b) => (
            <Link
              key={b.id}
              to="/catalogue"
              className="paper-card rounded-md p-4 flex flex-col justify-between hover:border-rock-blue/70 transition group"
            >
              <div className="flex gap-3">
                <BookCover
                  title={b.title}
                  author={b.author}
                  category={b.category}
                  size="sm"
                  className="group-hover:scale-105 transition"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] small-caps uppercase tracking-wider text-rock-blue-dark block truncate">
                    {b.category}
                  </span>
                  <h4 className="font-serif font-bold text-ink text-sm leading-tight line-clamp-2 mt-0.5 group-hover:text-venice-blue transition">
                    {b.title}
                  </h4>
                  <p className="text-xs text-ink-muted truncate mt-1">
                    {b.author} ({b.year})
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sand/70 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                <span>{b.shelf}</span>
                <span className="font-medium text-venice-blue">{b.copies}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Circulation Architecture Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-sand bg-merino-light/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-venice-blue text-merino flex items-center justify-center font-serif text-sm font-bold mb-3">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Live Catalogue & Filters
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Fast multi-parameter search by title, author, or ISBN. Toggle categories and instantly see live stack availability without page reloads.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-venice-blue text-merino flex items-center justify-center font-serif text-sm font-bold mb-3">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Circulation & Loan Renewal
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Strict 14-day loan duration with per-day fine calculations handled by the server (₹5/day). Patrons can renew loans up to 2 times directly from their ledger.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-venice-blue text-merino flex items-center justify-center font-serif text-sm font-bold mb-3">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Role-Based Clearance
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Members view their loans and reserve books; Librarians operate the desk; Administrators inspect Recharts velocity analytics. Unauthorized paths show a clean 403 page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
