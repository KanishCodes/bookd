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
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-sand/70 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand/60 border border-sand text-xs uppercase tracking-wider text-venice-blue font-bold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central University Circulation & Archival Ledger</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Curated Knowledge, <br />
            <span className="text-venice-blue">Timeless Volumes.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto font-medium leading-relaxed">
            Book’d is a role-governed library system. Explore 30+ physical stack volumes, check real-time copy availability, manage loans, and process circulation desk intakes.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full font-bold text-sm transition shadow-bento"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Catalogue (Logged in as {user?.name})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-sand bg-merino-light hover:bg-sand text-ink rounded-full font-bold text-sm transition shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-venice-blue" />
                  <span>My Loans Ledger</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full font-bold text-sm transition shadow-bento"
                >
                  <span>Sign In with Institutional Card</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalogue"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-sand bg-merino-light hover:bg-sand text-ink rounded-full font-bold text-sm transition shadow-sm"
                >
                  <Search className="w-4 h-4 text-venice-blue" />
                  <span>Browse Public Stacks</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Role-Based Archival Clearances - Bento Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-sand/70 bg-sand-light/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-wider font-bold text-venice-blue">
              Institutional Clearance System
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1 tracking-tight">
              Role-Governed Access Control
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-lg mx-auto font-medium">
              Institutional credentials route patrons, desk librarians, and academic administrators to their respective workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Member Card - Bento Yellow */}
            <div className="bg-[#FEF8E7] border border-amber-200/90 rounded-3xl p-6 shadow-bento hover:shadow-bento-hover transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 font-bold">
                    Patron / Student
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-extrabold text-ink text-xl tracking-tight">
                  Student Member
                </h3>
                <p className="text-xs font-mono font-medium text-amber-900/80 mt-1">
                  member@bookd.test (or kanish@bookd.test)
                </p>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed font-medium">
                  Browse physical holdings, manage your active 14-day loans, review return history, and renew items directly from your ledger.
                </p>
              </div>
            </div>

            {/* Librarian Card - Bento Mint */}
            <div className="bg-[#F0FDF4] border border-emerald-200/90 rounded-3xl p-6 shadow-bento hover:shadow-bento-hover transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-950 font-bold">
                    Circulation Staff
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center justify-center">
                    <Library className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-extrabold text-ink text-xl tracking-tight">
                  Desk Librarian
                </h3>
                <p className="text-xs font-mono font-medium text-emerald-900/80 mt-1">
                  librarian@bookd.test (or naisha@bookd.test)
                </p>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed font-medium">
                  Operate counter circulation: rapid book checkout, instant return intake with fine calculation, and stack inventory acquisition.
                </p>
              </div>
            </div>

            {/* Admin Card - Bento Purple */}
            <div className="bg-[#F5F2FE] border border-purple-200/90 rounded-3xl p-6 shadow-bento hover:shadow-bento-hover transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-purple-200/80 text-purple-950 font-bold">
                    Academic Governance
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-200/80 text-purple-900 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-extrabold text-ink text-xl tracking-tight">
                  Library Administrator
                </h3>
                <p className="text-xs font-mono font-medium text-purple-900/80 mt-1">
                  admin@bookd.test (or patel@bookd.test)
                </p>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed font-medium">
                  Monitor high-demand titles via Recharts, circulation turnover velocity, delinquent patron records, and total fine recovery.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded-full text-xs font-bold uppercase tracking-wider transition shadow-bento"
            >
              <span>Sign In with University Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured From The Archive */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-sand mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-ink-muted">
              Select Highlights
            </span>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight mt-1">
              Featured Archival Volumes
            </h2>
            <p className="text-sm text-ink-muted mt-1 font-medium">
              Handpicked essential monographs across technical and humanistic disciplines.
            </p>
          </div>

          <Link
            to="/catalogue"
            className="text-xs font-bold uppercase tracking-wider text-venice-blue hover:underline flex items-center gap-1.5"
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
              className="bento-card rounded-3xl p-5 flex flex-col justify-between hover:border-rock-blue/70 transition-all group shadow-bento hover:shadow-bento-hover"
            >
              <div className="flex gap-3">
                <BookCover
                  title={b.title}
                  author={b.author}
                  category={b.category}
                  size="sm"
                  className="group-hover:scale-105 transition-transform duration-200 rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rock-blue-dark block truncate">
                    {b.category}
                  </span>
                  <h4 className="font-bold text-ink text-sm leading-tight line-clamp-2 mt-1 group-hover:text-venice-blue transition">
                    {b.title}
                  </h4>
                  <p className="text-xs text-ink-muted truncate mt-1 font-medium">
                    {b.author} ({b.year})
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sand/70 flex items-center justify-between text-[11px] font-mono text-ink-muted font-medium">
                <span>{b.shelf}</span>
                <span className="font-bold text-venice-blue">{b.copies}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Circulation Architecture Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-sand/70 bg-merino-light/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bento-card rounded-3xl p-6 border border-sand shadow-bento space-y-2">
              <div className="w-10 h-10 rounded-full bg-venice-blue text-merino flex items-center justify-center text-sm font-extrabold mb-3 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-extrabold text-ink tracking-tight">
                Live Catalogue & Filters
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-medium">
                Fast multi-parameter search by title, author, or ISBN. Toggle categories and instantly see live stack availability without page reloads.
              </p>
            </div>

            <div className="bento-card rounded-3xl p-6 border border-sand shadow-bento space-y-2">
              <div className="w-10 h-10 rounded-full bg-venice-blue text-merino flex items-center justify-center text-sm font-extrabold mb-3 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-extrabold text-ink tracking-tight">
                Circulation & Loan Renewal
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-medium">
                Strict 14-day loan duration with per-day fine calculations handled by the server (₹5/day). Patrons can renew loans up to 2 times directly from their ledger.
              </p>
            </div>

            <div className="bento-card rounded-3xl p-6 border border-sand shadow-bento space-y-2">
              <div className="w-10 h-10 rounded-full bg-venice-blue text-merino flex items-center justify-center text-sm font-extrabold mb-3 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-extrabold text-ink tracking-tight">
                Role-Based Clearance
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-medium">
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
