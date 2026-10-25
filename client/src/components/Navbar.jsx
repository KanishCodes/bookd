import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BookOpen,
  Library,
  User,
  BarChart3,
  LogOut,
  Menu,
  X,
  CreditCard,
  BookmarkCheck,
  ShieldAlert
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav items based on role
  const getNavLinks = () => {
    const common = [
      { to: '/catalogue', label: 'Catalogue', icon: BookOpen }
    ];

    if (role === 'member') {
      return [
        ...common,
        { to: '/dashboard', label: 'My Loans', icon: User },
        { to: '/reservations', label: 'Reservations', icon: BookmarkCheck },
        { to: '/fines', label: 'Pay Fines', icon: CreditCard }
      ];
    }

    if (role === 'librarian') {
      return [
        ...common,
        { to: '/librarian', label: 'Circulation Desk', icon: Library },
        { to: '/reservations', label: 'Reservations', icon: BookmarkCheck }
      ];
    }

    if (role === 'admin') {
      return [
        ...common,
        { to: '/librarian', label: 'Circulation Desk', icon: Library },
        { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
        { to: '/reservations', label: 'Reservations', icon: BookmarkCheck },
        { to: '/fines', label: 'Fine Collection', icon: CreditCard }
      ];
    }

    return common;
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-merino border-b border-sand shadow-sm">
      {/* Top Demo Banner / Quick Role Switcher */}
      <div className="bg-sand-light border-b border-sand/70 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="font-serif italic text-venice-blue font-medium">Evaluation Demo Mode:</span>
          <span>Switch active identity:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchDemoRole('member')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              role === 'member'
                ? 'bg-venice-blue text-merino shadow-sm'
                : 'bg-merino hover:bg-sand text-ink-muted border border-sand'
            }`}
          >
            Member (Kanish)
          </button>
          <button
            onClick={() => switchDemoRole('librarian')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              role === 'librarian'
                ? 'bg-venice-blue text-merino shadow-sm'
                : 'bg-merino hover:bg-sand text-ink-muted border border-sand'
            }`}
          >
            Librarian (Naisha)
          </button>
          <button
            onClick={() => switchDemoRole('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              role === 'admin'
                ? 'bg-venice-blue text-merino shadow-sm'
                : 'bg-merino hover:bg-sand text-ink-muted border border-sand'
            }`}
          >
            Admin (Dr. Patel)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/catalogue" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded bg-venice-blue text-merino flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:bg-venice-blue-hover transition">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-ink leading-none">
                  Book’d
                </span>
                <span className="text-[10px] tracking-widest uppercase small-caps text-ink-muted font-sans font-medium">
                  Circulation System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
                        isActive
                          ? 'bg-venice-blue text-merino font-semibold shadow-sm'
                          : 'text-ink-muted hover:text-ink hover:bg-sand/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-ink leading-none">
                    {user.name}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-ink-muted">
                      {user.memberId}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider small-caps px-1.5 py-0.2 rounded bg-rock-blue/20 text-venice-blue font-semibold border border-rock-blue/30">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded text-ink-muted hover:text-warm-red hover:bg-warm-red/10 border border-sand transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-venice-blue text-merino text-sm rounded font-medium hover:bg-venice-blue-hover transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-ink hover:bg-sand transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand bg-merino px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium ${
                    isActive
                      ? 'bg-venice-blue text-merino font-semibold'
                      : 'text-ink-muted hover:bg-sand/60 text-ink'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 border-t border-sand flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-ink-muted capitalize">{user?.role} • {user?.memberId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-warm-red bg-warm-red/10 rounded border border-warm-red/20 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
