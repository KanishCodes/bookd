import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, Building2, ArrowRight, ArrowLeft } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Management Studies',
  'Humanities',
  'General Studies'
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: DEPARTMENTS[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Role is never sent from the client: server must default new accounts to "member".
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department
      });
      navigate('/catalogue', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-9 pr-3 py-2 bg-merino-light border border-sand rounded text-xs text-ink placeholder-ink-muted/50 focus:outline-none focus:border-venice-blue transition';
  const labelClass =
    'block text-xs small-caps uppercase tracking-wider font-semibold text-ink-muted mb-1';

  return (
    <div className="min-h-screen bg-merino flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
          <ArrowLeft className="w-4 h-4 text-ink-muted group-hover:text-ink transition" />
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted group-hover:text-ink transition">
            Back to Public Entrance
          </span>
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-venice-blue text-merino flex items-center justify-center text-2xl font-extrabold mx-auto shadow-bento mt-1 mb-2">
          B
        </div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Join Book’d</h1>
        <p className="mt-0.5 text-xs text-ink-muted font-medium">
          Create your library member card
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bento-card rounded-3xl p-8 border border-sand shadow-bento">
          {error && (
            <div className="mb-4 p-3 bg-warm-red/10 border border-warm-red/25 rounded-2xl text-warm-red text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={form.name} onChange={update('name')} placeholder="Your full name" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" value={form.email} onChange={update('email')} placeholder="you@university.edu" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <select value={form.department} onChange={update('department')} className={inputClass}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={form.password} onChange={update('password')} placeholder="••••••" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••" className={inputClass} />
                </div>
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Member Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3.5 border-t border-sand text-center text-[11px] text-ink-muted">
            Already have a card?{' '}
            <Link to="/login" className="font-bold text-venice-blue hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;