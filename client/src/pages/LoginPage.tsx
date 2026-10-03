import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'admin' | 'author' | 'user') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      navigate(role === 'admin' ? '/admin/dashboard' : role === 'author' ? '/author/dashboard' : '/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xs">
          <div className="text-center mb-6">
            <span className="font-serif text-2xl font-bold text-stone-900 block">
              Ink & Quill
            </span>
            <h1 className="text-base font-bold text-stone-800 mt-1">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter your credentials to access protected editorial features.
            </p>
          </div>

          {/* Quick Credential Buttons for Testing */}
          <div className="mb-6 p-3 bg-stone-50 border border-stone-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Instant Test Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuick('admin')}
                className="py-1.5 px-2 bg-white border border-stone-200 text-stone-800 rounded text-[11px] font-medium hover:bg-stone-100 flex items-center justify-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3 h-3 text-stone-700" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuick('author')}
                className="py-1.5 px-2 bg-white border border-stone-200 text-stone-800 rounded text-[11px] font-medium hover:bg-stone-100 flex items-center justify-center gap-1 transition-colors"
              >
                <span>Author Login</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400 bg-stone-50/50"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-400 bg-stone-50/50"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with JWT'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-stone-900 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
