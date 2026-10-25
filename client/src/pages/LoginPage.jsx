import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  KeyRound,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  ArrowLeft
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('member@bookd.test');
  const [password, setPassword] = useState('demo1234');

  // Signup form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('demo1234');
  const [department, setDepartment] = useState('Computer Engineering');
  const [role, setRole] = useState('member');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to redirect user to their specific role landing view
  const redirectByRole = (userRole) => {
    if (userRole === 'librarian') {
      navigate('/librarian', { replace: true });
    } else if (userRole === 'admin') {
      navigate('/reports', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      redirectByRole(res.user?.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email: signupEmail,
        password: signupPassword,
        role,
        department
      });
      redirectByRole(res.user?.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create library account.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (targetEmail, targetPassword = 'demo1234') => {
    setEmail(targetEmail);
    setPassword(targetPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-merino flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <ArrowLeft className="w-4 h-4 text-ink-muted group-hover:text-ink transition" />
          <span className="text-xs font-sans uppercase tracking-wider small-caps text-ink-muted group-hover:text-ink transition">
            Back to Public Entrance
          </span>
        </Link>
        <div className="w-12 h-12 rounded bg-venice-blue text-merino flex items-center justify-center font-serif text-2xl font-bold mx-auto shadow-sm mt-1 mb-2">
          B
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">
          Book’d
        </h1>
        <p className="mt-0.5 text-xs text-ink-muted font-sans">
          University Circulation & Archival Ledger
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="paper-card rounded-lg p-7 shadow-card-subtle">
          {/* Mode Switch Tabs: Sign In vs Sign Up */}
          <div className="flex border-b border-sand mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider small-caps transition border-b-2 -mb-[1px] ${
                mode === 'login'
                  ? 'border-venice-blue text-venice-blue'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Sign In (Existing Patron)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider small-caps transition border-b-2 -mb-[1px] ${
                mode === 'signup'
                  ? 'border-venice-blue text-venice-blue'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Sign Up (New Patron / Staff)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-warm-red/10 border border-warm-red/25 rounded text-warm-red text-xs">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            /* Sign In Form */
            <div>
              {/* Quick Preset Hints: Fill only, does not auto-submit */}
              <div className="mb-4 p-3 bg-sand/35 rounded border border-sand">
                <div className="flex items-center justify-between text-[11px] font-semibold text-venice-blue uppercase small-caps tracking-wider mb-1.5">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Quick Fill Account ID:
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted font-normal">
                    Password: demo1234
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillCredentials('kanish@bookd.test')}
                    className={`py-1 px-1.5 rounded text-left text-[11px] transition border ${
                      email.includes('member') || email.includes('kanish')
                        ? 'bg-venice-blue text-merino border-venice-blue font-medium'
                        : 'bg-merino-light text-ink hover:bg-sand border-sand'
                    }`}
                  >
                    <div className="font-semibold truncate">Member</div>
                    <div className="text-[9px] opacity-75 font-mono">kanish@bookd</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('naisha@bookd.test')}
                    className={`py-1 px-1.5 rounded text-left text-[11px] transition border ${
                      email.includes('librarian') || email.includes('naisha')
                        ? 'bg-venice-blue text-merino border-venice-blue font-medium'
                        : 'bg-merino-light text-ink hover:bg-sand border-sand'
                    }`}
                  >
                    <div className="font-semibold truncate">Librarian</div>
                    <div className="text-[9px] opacity-75 font-mono">naisha@bookd</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('patel@bookd.test')}
                    className={`py-1 px-1.5 rounded text-left text-[11px] transition border ${
                      email.includes('admin') || email.includes('patel')
                        ? 'bg-venice-blue text-merino border-venice-blue font-medium'
                        : 'bg-merino-light text-ink hover:bg-sand border-sand'
                    }`}
                  >
                    <div className="font-semibold truncate">Admin</div>
                    <div className="text-[9px] opacity-75 font-mono">patel@bookd</div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                    Institutional Email / Card ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kanish@bookd.test"
                      className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 bg-venice-blue hover:bg-venice-blue-hover text-merino font-medium text-xs uppercase small-caps tracking-wider rounded transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-merino border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In & Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Sign Up / Registration Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kanish Mahajan"
                    className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@univ.edu"
                    className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                  Department / Division
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Engineering"
                    className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                  Select Institutional Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink focus:outline-none focus:border-venice-blue"
                >
                  <option value="member">Student / Patron (Borrow, Holds & Dashboard)</option>
                  <option value="librarian">Circulation Staff (Desk Intake & Returns)</option>
                  <option value="admin">Administrator (Analytics & Stack Governance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                  Set Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-venice-blue hover:bg-venice-blue-hover text-merino font-medium text-xs uppercase small-caps tracking-wider rounded transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-merino border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Enroll Card & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-3.5 border-t border-sand text-center text-[11px] text-ink-muted">
            Evaluation demonstration • Role-governed circulation ledger
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
