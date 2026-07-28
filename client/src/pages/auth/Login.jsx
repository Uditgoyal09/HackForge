import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Award, Crown, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const portalsConfig = [
  {
    id: 'participant',
    title: 'Participant Portal',
    description: 'Compete, join teams, and submit project deliverables.',
    icon: User,
    color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10 hover:border-indigo-500',
  },
  {
    id: 'organizer',
    title: 'Organizer Portal',
    description: 'Host events, approve registrations, and publish results.',
    icon: Shield,
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10 hover:border-purple-500',
  },
  {
    id: 'judge',
    title: 'Judge Portal',
    description: 'Review assigned submissions and score criteria.',
    icon: Award,
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:border-cyan-500',
  },
  {
    id: 'admin',
    title: 'Super Admin Portal',
    description: 'Platform controls, user moderation, and audit logs.',
    icon: Crown,
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10 hover:border-rose-500',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login: setAuthSession } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedPortal, setSelectedPortal] = useState('participant');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectPortal = (portalId) => {
    setSelectedPortal(portalId);
    setStep(2);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    setStep(3); // Loading state

    try {
      const res = await authService.login({
        email: email.trim(),
        password,
        loginAs: selectedPortal,
      });

      if (res.success && res.data) {
        toast.success(`Welcome back to ${selectedPortal.toUpperCase()} Portal!`);
        setAuthSession(res.data, res.data.token);

        // Redirect to portal dashboard
        if (selectedPortal === 'organizer') navigate('/organizer/dashboard');
        else if (selectedPortal === 'judge') navigate('/judge/dashboard');
        else if (selectedPortal === 'admin') navigate('/admin/dashboard');
        else navigate('/participant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
      setStep(2); // Return to credentials step on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center pt-24 pb-12 px-6">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {/* STEP 1: PORTAL SELECTION */}
          {step === 1 && (
            <motion.div
              key="portal-step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-extrabold mb-2 text-center">Welcome Back to HackVerse</h2>
              <p className="text-xs text-slate-400 text-center mb-8">Select your target portal to proceed to authentication.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {portalsConfig.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPortal(p.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${p.color}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-bold text-sm text-white">{p.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.description}</p>
                      <div className="flex items-center text-xs font-semibold text-white gap-1 group">
                        Access Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-xs text-slate-500 border-t border-slate-800/60 pt-6">
                Don't have an account yet?{' '}
                <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
                  Sign up for HackVerse
                </Link>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CREDENTIALS INPUT */}
          {step === 2 && (
            <motion.div
              key="portal-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Portals
                </button>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedPortal} Portal
                </span>
              </div>

              <h2 className="text-2xl font-extrabold mb-1">Enter Credentials</h2>
              <p className="text-xs text-slate-400 mb-6">Authenticate to access your {selectedPortal.toUpperCase()} dashboard.</p>

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
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 mt-6"
                >
                  Log in to {selectedPortal.toUpperCase()} Portal <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: AUTHENTICATING LOADING TRANSITION */}
          {step === 3 && (
            <motion.div
              key="portal-step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto animate-spin">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl">Authenticating {selectedPortal.toUpperCase()}...</h3>
              <p className="text-xs text-slate-400">Verifying credentials and MongoDB role permissions.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
