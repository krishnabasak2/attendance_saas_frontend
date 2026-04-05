import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { getErrorMessage } from '../utils/helpers.ts';

export default function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState<'admin' | 'student'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = (newRole: 'admin' | 'student') => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="text-5xl">🎓</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-800">Attendance SaaS</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        {/* Role toggle */}
        <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              role === 'admin'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('student')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              role === 'student'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Student
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder={role === 'admin' ? 'admin@example.com' : 'student@example.com'}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm
                outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold
              text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {role === 'admin' && (
          <p className="mt-6 text-center text-xs text-slate-400">
            Default: admin@example.com / Admin@123
          </p>
        )}
        {role === 'student' && (
          <p className="mt-6 text-center text-xs text-slate-400">
            Use the email and password set by your admin
          </p>
        )}
      </div>
    </div>
  );
}
