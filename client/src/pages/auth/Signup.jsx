import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Award, Lock, Mail, ArrowRight, ArrowLeft, Key, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const rolesConfig = [
  {
    id: 'participant',
    title: 'Participant',
    description: 'Join hackathons, create teams, and build innovative projects.',
    icon: User,
    badge: 'Public Access',
    color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
  },
  {
    id: 'organizer',
    title: 'Organizer',
    description: 'Host, manage, review applications, and judge hackathons.',
    icon: Shield,
    badge: 'Verification Required',
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'judge',
    title: 'Judge',
    description: 'Evaluate submissions, score criteria, and select winners.',
    icon: Award,
    badge: 'Verification Required',
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const { login: setAuthSession } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('participant');

  // Account Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role-Specific Info
  const [verificationCode, setVerificationCode] = useState('');
  const [college, setCollege] = useState('');
  const [skills, setSkills] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [expertise, setExpertise] = useState('');

  const [loading, setLoading] = useState(false);

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all account fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = (e) => {
    e.preventDefault();
    if ((role === 'organizer' || role === 'judge') && !verificationCode.trim()) {
      toast.error(`Please enter your ${role.toUpperCase()} verification access code`);
      return;
    }
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setStep(5); // Loading transition

    try {
      const payload = {
        name,
        email,
        password,
        role,
        verificationCode: (role === 'organizer' || role === 'judge') ? verificationCode.trim() : undefined,
        profile: {
          college: role === 'participant' ? college : undefined,
          skills: role === 'participant' ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          organizationName: role === 'organizer' ? organizationName : undefined,
          expertise: role === 'judge' ? expertise : undefined,
        },
      };

      const res = await authService.signup(payload);
      if (res.success && res.data) {
        toast.success(`${role.toUpperCase()} account created successfully!`);
        setAuthSession(res.data, res.data.token);
        
        // Redirect to matching portal
        if (role === 'organizer') navigate('/organizer/dashboard');
        else if (role === 'judge') navigate('/judge/dashboard');
        else navigate('/participant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      setStep(3); // Return to verification step on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center pt-24 pb-12 px-6">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>STEP {step} OF 4</span>
          <span>{step === 1 ? 'ROLE' : step === 2 ? 'ACCOUNT' : step === 3 ? 'VERIFY / PROFILE' : 'REVIEW'}</span>
        </div>
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-8">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-extrabold mb-2 text-center">How will you use HackVerse?</h2>
              <p className="text-xs text-slate-400 text-center mb-8">Select your primary portal account type to begin onboarding.</p>

              <div className="space-y-4 mb-8">
                {rolesConfig.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${r.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm text-white">{r.title}</h3>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${r.color}`}>
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleNextStep1}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                Continue to Account Setup <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: ACCOUNT DETAILS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Roles
                </button>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {role} Account
                </span>
              </div>

              <h2 className="text-2xl font-extrabold mb-1">Account Credentials</h2>
              <p className="text-xs text-slate-400 mb-6">Enter your details to create your HackVerse user identity.</p>

              <form onSubmit={handleNextStep2} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 mt-6"
                >
                  Next: {role === 'participant' ? 'Profile Details' : 'Verification'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: ROLE-SPECIFIC VERIFICATION / ONBOARDING */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <button onClick={() => setStep(2)} className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Credentials
              </button>

              <h2 className="text-2xl font-extrabold mb-1">
                {role === 'participant' ? 'Developer Profile' : `${role.toUpperCase()} Verification`}
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {role === 'participant'
                  ? 'Tell us about your developer skills and academic institution.'
                  : `${role.toUpperCase()} accounts require a cryptographically issued HackVerse verification code.`}
              </p>

              <form onSubmit={handleNextStep3} className="space-y-4 text-xs">
                {(role === 'organizer' || role === 'judge') && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                    <label className="block font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-400" /> {role.toUpperCase()} Access Verification Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={role === 'organizer' ? 'ORG-XXXXXXXX' : 'JDG-XXXXXXXX'}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-amber-400/80 mt-1.5">
                      Enter the secure access code issued by your HackVerse platform administrator.
                    </p>
                  </div>
                )}

                {role === 'participant' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">College / University</label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford University"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Primary Skills (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="React, Node.js, Solidity, Python"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {role === 'organizer' && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Organization / Host Name</label>
                    <input
                      type="text"
                      placeholder="e.g. LPU Developer Club"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {role === 'judge' && (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Expertise / Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Systems & Smart Contracts"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 mt-6"
                >
                  Review Onboarding <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <button onClick={() => setStep(3)} className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Verification
              </button>

              <h2 className="text-2xl font-extrabold mb-1">Review Registration</h2>
              <p className="text-xs text-slate-400 mb-6">Confirm your details before creating your HackVerse account.</p>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="font-bold text-indigo-400 uppercase font-mono">{role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="font-semibold text-white">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-white">{email}</span>
                </div>
                {(role === 'organizer' || role === 'judge') && (
                  <div className="flex justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400">Access Code:</span>
                    <span className="font-mono text-amber-400 font-bold">••••••••</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleFinalSubmit}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Create {role.toUpperCase()} Account
              </button>
            </motion.div>
          )}

          {/* STEP 5: LOADING TRANSITION */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto animate-spin">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl">Creating Your {role.toUpperCase()} Account...</h3>
              <p className="text-xs text-slate-400">Verifying code and establishing MongoDB user record.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Log in to Portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
