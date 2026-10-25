import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BookOpen, KeyRound, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/catalogue';

  const [email, setEmail] = useState('member@bookd.test');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-merino flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded bg-venice-blue text-merino flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-sm mb-3">
          B
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">
          Book’d
        </h1>
        <p className="mt-1 text-sm text-ink-muted font-sans">
          Central Library Circulation & Archival Catalogue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="paper-card rounded-lg p-8 shadow-card-subtle">
          {/* Demo Quick Accounts Banner */}
          <div className="mb-6 p-3.5 bg-sand/40 rounded border border-sand">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-venice-blue uppercase small-caps tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Demo Accounts (1-Click Fill)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('member@bookd.test')}
                className={`py-1.5 px-2 rounded text-left text-xs transition border ${
                  email === 'member@bookd.test'
                    ? 'bg-venice-blue text-merino border-venice-blue font-medium'
                    : 'bg-merino-light text-ink hover:bg-sand border-sand'
                }`}
              >
                <div className="font-medium truncate">Member</div>
                <div className="text-[10px] opacity-75">Kanish</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('librarian@bookd.test')}
                className={`py-1.5 px-2 rounded text-left text-xs transition border ${
                  email === 'librarian@bookd.test'
                    ? 'bg-venice-blue text-merino border-venice-blue font-medium'
                    : 'bg-merino-light text-ink hover:bg-sand border-sand'
                }`}
              >
                <div className="font-medium truncate">Librarian</div>
                <div className="text-[10px] opacity-75">Naisha</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('admin@bookd.test')}
                className={`py-1.5 px-2 rounded text-left text-xs transition border ${
                  email === 'admin@bookd.test'
                    ? 'bg-venice-blue text-merino border-venice-blue font-medium'
                    : 'bg-merino-light text-ink hover:bg-sand border-sand'
                }`}
              >
                <div className="font-medium truncate">Admin</div>
                <div className="text-[10px] opacity-75">Dr. Patel</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-warm-red/10 border border-warm-red/25 rounded text-warm-red text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bookd.test"
                  className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
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
                  className="w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition"
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1 font-mono">
                Evaluation password: <span className="font-semibold text-venice-blue">demo1234</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-venice-blue hover:bg-venice-blue-hover text-merino font-medium text-sm rounded transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-merino border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Circulation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-sand text-center text-xs text-ink-muted">
            Evaluation demonstration build • Role-based access control enabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
