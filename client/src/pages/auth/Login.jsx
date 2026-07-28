import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Terminal, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isBlocked = searchParams.get('blocked') === 'true';
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect by role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'organizer':
          navigate('/organizer/dashboard');
          break;
        case 'judge':
          navigate('/judge/dashboard');
          break;
        case 'participant':
        default:
          navigate('/participant/dashboard');
          break;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Terminal className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight">Sign In to HackVerse</h2>
          <p className="text-xs text-slate-400 mt-1">Access your hackathons, teams, and dashboard.</p>
        </div>

        {/* Status Alerts */}
        {isBlocked && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Your account is currently blocked by an administrator.</p>
          </div>
        )}

        {isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Your session has expired. Please sign in again.</p>
          </div>
        )}

        {errorMsg && !isBlocked && !isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
            Create Participant Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
