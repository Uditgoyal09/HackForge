import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, Sparkles, Shield, User, Award, Crown } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const roleOnboardingMessages = {
  participant: {
    welcome: 'Ready to build something amazing?',
    workspace: 'Opening your Participant Workspace...',
    icon: User,
    color: 'text-primary border-primary/30 bg-primary/10',
    bar: 'bg-primary',
    route: '/participant/dashboard',
  },
  organizer: {
    welcome: "Let's create the next great hackathon.",
    workspace: 'Opening your Organizer Workspace...',
    icon: Shield,
    color: 'text-warning border-warning/30 bg-warning/10',
    bar: 'bg-warning',
    route: '/organizer/dashboard',
  },
  judge: {
    welcome: 'Ready to discover the best innovations?',
    workspace: 'Opening your Judge Workspace...',
    icon: Award,
    color: 'text-success border-success/30 bg-success/10',
    bar: 'bg-success',
    route: '/judge/dashboard',
  },
  admin: {
    welcome: 'Welcome back to HackForge Control.',
    workspace: 'Opening your Admin Workspace...',
    icon: Crown,
    color: 'text-error border-error/30 bg-error/10',
    bar: 'bg-error',
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
        setAuthState('identified');

        setTimeout(() => {
          setAuthState('workspace_loading');
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          {(authState === 'idle' || authState === 'authenticating') && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 shadow-2xl bg-card/60 backdrop-blur-xl border-border/80">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">WELCOME BACK</h1>
                  <p className="text-xs text-muted-foreground">Continue your HackForge journey.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-5 text-sm">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                      <Input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={authState === 'authenticating'}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={authState === 'authenticating'}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground text-xs">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/50 bg-surface"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => toast.info('Password reset instructions will be sent to your registered email.')}
                      className="text-primary hover:underline text-xs"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    isLoading={authState === 'authenticating'}
                    className="w-full mt-6"
                  >
                    {!authState === 'authenticating' && (
                      <>
                        <span>Login to HackForge</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Bottom Signup Link */}
                <div className="text-center text-xs text-muted-foreground border-t border-border/50 pt-6 mt-6">
                  New to HackForge?{' '}
                  <Link to="/signup" className="text-primary hover:underline font-semibold">
                    Create Account
                  </Link>
                </div>
              </Card>
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
            >
              <Card className="p-10 text-center shadow-2xl bg-card/80 backdrop-blur-2xl">
                <div className={`w-16 h-16 rounded-[20px] border ${currentRoleConfig.color} flex items-center justify-center mx-auto shadow-lg mb-6`}>
                  <RoleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Welcome back, {authUser.name} 👋
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mb-6">
                    {currentRoleConfig.welcome}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-[11px] font-mono uppercase text-primary font-bold">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Authenticated as {authUser.role}
                </div>
              </Card>
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
            >
              <Card className="p-10 text-center shadow-2xl bg-card/80 backdrop-blur-2xl space-y-6">
                <div className={`w-16 h-16 rounded-[20px] border ${currentRoleConfig.color} flex items-center justify-center mx-auto shadow-lg`}>
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {currentRoleConfig.workspace}
                  </h2>
                  <p className="text-xs text-muted-foreground">Loading your live dashboard and metrics...</p>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className={`h-full ${currentRoleConfig.bar}`}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
