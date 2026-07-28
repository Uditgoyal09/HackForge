import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, Sparkles, Shield, User, Award, Crown } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const roleOnboardingMessages = {
  participant: {
    welcome: 'Ready to build something amazing?',
    workspace: 'Opening your Participant Workspace...',
    icon: User,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    bar: 'bg-indigo-500',
    route: '/participant/dashboard',
  },
  organizer: {
    welcome: "Let's create the next great hackathon.",
    workspace: 'Opening your Organizer Workspace...',
    icon: Shield,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    bar: 'bg-purple-500',
    route: '/organizer/dashboard',
  },
  judge: {
    welcome: 'Ready to discover the best innovations?',
    workspace: 'Opening your Judge Workspace...',
    icon: Award,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    bar: 'bg-cyan-500',
    route: '/judge/dashboard',
  },
  admin: {
    welcome: 'Welcome back to HackVerse Control.',
    workspace: 'Opening your Admin Workspace...',
    icon: Crown,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    bar: 'bg-rose-500',
    route: '/admin/dashboard',
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { login: setAuthSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // States: 'idle' | 'authenticating' | 'identified' | 'workspace_loading'
  const [authState, setAuthState] = useState('idle');
  const [authUser, setAuthUser] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setAuthState('authenticating');

    try {
      const res = await authService.login({
        email: email.trim(),
        password,
      });

      if (res.success && res.data) {
        const user = res.data;
        setAuthUser(user);

        // State 2: User Identified
        setAuthState('identified');

        // State 3: Workspace Loading after 700ms
        setTimeout(() => {
          setAuthState('workspace_loading');

          // Redirect to role dashboard after 700ms
          setTimeout(() => {
            setAuthSession(user, user.token);
            const targetRoute = roleOnboardingMessages[user.role]?.route || '/participant/dashboard';
            navigate(targetRoute);
          }, 700);
        }, 700);
      } else {
        setAuthState('idle');
        toast.error(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setAuthState('idle');
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      toast.error(errorMsg);
    }
  };

  const currentRoleConfig = authUser
    ? roleOnboardingMessages[authUser.role] || roleOnboardingMessages.participant
    : roleOnboardingMessages.participant;
  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          {/* LOGIN FORM (IDLE or AUTHENTICATING) */}
          {(authState === 'idle' || authState === 'authenticating') && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-indigo-950/20"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white mb-1">WELCOME BACK</h1>
                <p className="text-xs text-slate-400">Continue your HackVerse journey.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={authState === 'authenticating'}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authState === 'authenticating'}
                      className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => toast.info('Password reset instructions will be sent to your registered email.')}
                    className="text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={authState === 'authenticating'}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {authState === 'authenticating' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to HackVerse</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Signup Link */}
              <div className="text-center text-xs text-slate-500 border-t border-slate-800/60 pt-6 mt-6">
                New to HackVerse?{' '}
                <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
                  Create Account
                </Link>
              </div>
            </motion.div>
          )}

          {/* ONBOARDING STATE 2: USER IDENTIFIED */}
          {authState === 'identified' && authUser && (
            <motion.div
              key="onboarding-identified"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 text-center shadow-2xl space-y-6"
            >
              <div className={`w-16 h-16 rounded-3xl border ${currentRoleConfig.color} flex items-center justify-center mx-auto shadow-lg`}>
                <RoleIcon className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white mb-2">
                  Welcome back, {authUser.name} 👋
                </h2>
                <p className="text-sm font-medium text-slate-300">
                  {currentRoleConfig.welcome}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono uppercase text-indigo-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Authenticated as {authUser.role}
              </div>
            </motion.div>
          )}

          {/* ONBOARDING STATE 3: WORKSPACE LOADING */}
          {authState === 'workspace_loading' && authUser && (
            <motion.div
              key="onboarding-workspace"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 text-center shadow-2xl space-y-6"
            >
              <div className={`w-16 h-16 rounded-3xl border ${currentRoleConfig.color} flex items-center justify-center mx-auto shadow-lg`}>
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {currentRoleConfig.workspace}
                </h2>
                <p className="text-xs text-slate-400">Loading your live dashboard and MongoDB metrics...</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className={`h-full ${currentRoleConfig.bar}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
