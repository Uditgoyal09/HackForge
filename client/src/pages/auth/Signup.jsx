import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Award, Lock, Mail, ArrowRight, ArrowLeft, Key, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const rolesConfig = [
  {
    id: 'participant',
    title: 'Participant',
    description: 'Join hackathons, create teams, and build innovative projects.',
    icon: User,
    badge: 'Public Access',
    color: 'border-primary/60 text-primary bg-primary/10',
  },
  {
    id: 'organizer',
    title: 'Organizer',
    description: 'Host, manage, review applications, and judge hackathons.',
    icon: Shield,
    badge: 'Verification Required',
    color: 'border-warning/60 text-warning bg-warning/10',
  },
  {
    id: 'judge',
    title: 'Judge',
    description: 'Evaluate submissions, score criteria, and select winners.',
    icon: Award,
    badge: 'Verification Required',
    color: 'border-success/60 text-success bg-success/10',
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role-Specific Info
  const [verificationCode, setVerificationCode] = useState('');
  const [college, setCollege] = useState('');
  const [skills, setSkills] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [expertise, setExpertise] = useState('');

  const [loading, setLoading] = useState(false);

  const handleNextStep1 = () => setStep(2);

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
        if (role === 'organizer') navigate('/organizer/dashboard');
        else if (role === 'judge') navigate('/judge/dashboard');
        else navigate('/participant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between text-xs font-mono font-bold text-foreground">
          <span>STEP {step > 4 ? 4 : step} OF 4</span>
          <span className="text-foreground-secondary">{step === 1 ? 'ROLE' : step === 2 ? 'ACCOUNT' : step === 3 ? 'VERIFY / PROFILE' : 'REVIEW'}</span>
        </div>
        <div className="w-full bg-surface-hover border border-border h-2 rounded-full overflow-hidden mb-8">
          <div
            className="bg-primary h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(182,255,0,0.4)]"
            style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <Card className="p-8 shadow-2xl bg-card/60 backdrop-blur-xl">
                <h2 className="text-2xl font-extrabold mb-2 text-center text-foreground">How will you use HackVerse?</h2>
                <p className="text-sm text-foreground-secondary text-center mb-8">Select your primary portal account type to begin onboarding.</p>

                <div className="space-y-4 mb-8">
                  {rolesConfig.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRole(r.id); } }}
                        className={`w-full text-left p-5 rounded-[14px] border cursor-pointer transition-all duration-300 flex items-start gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(182,255,0,0.15)] ring-1 ring-primary'
                            : 'bg-surface border-border hover:bg-surface-hover hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-lg'
                        }`}
                      >
                        <div className={`p-3 rounded-xl border transition-colors duration-300 shrink-0 ${isSelected ? 'border-primary bg-primary text-primary-foreground' : r.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 relative">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-bold text-sm transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{r.title}</h3>
                            <Badge variant={isSelected ? 'primary' : 'outline'} className="text-[9px]">{r.badge}</Badge>
                          </div>
                          <p className={`text-sm leading-relaxed pr-6 ${isSelected ? 'text-foreground-secondary' : 'text-foreground-muted'}`}>{r.description}</p>
                          {isSelected && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-0 bottom-0 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                            </motion.div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button className="w-full" onClick={handleNextStep1}>
                  Continue to Account Setup <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: ACCOUNT DETAILS */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <Card className="p-8 shadow-2xl bg-card/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setStep(1)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Roles
                  </button>
                  <Badge variant="primary" className="text-[10px]">{role} Account</Badge>
                </div>

                <h2 className="text-2xl font-extrabold mb-1">Account Credentials</h2>
                <p className="text-sm text-foreground-secondary mb-6">Enter your details to create your HackVerse user identity.</p>

                <form onSubmit={handleNextStep2} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Full Name</label>
                    <Input required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Email Address</label>
                    <Input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Password</label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6">
                    Next: {role === 'participant' ? 'Profile Details' : 'Verification'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: ROLE-SPECIFIC */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <Card className="p-8 shadow-2xl bg-card/60 backdrop-blur-xl">
                <button onClick={() => setStep(2)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Credentials
                </button>

                <h2 className="text-2xl font-extrabold mb-1">
                  {role === 'participant' ? 'Developer Profile' : `${role.toUpperCase()} Verification`}
                </h2>
                <p className="text-sm text-foreground-secondary mb-6">
                  {role === 'participant'
                    ? 'Tell us about your developer skills and academic institution.'
                    : `${role.toUpperCase()} accounts require a cryptographically issued HackVerse verification code.`}
                </p>

                <form onSubmit={handleNextStep3} className="space-y-4 text-sm">
                  {(role === 'organizer' || role === 'judge') && (
                    <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-warning flex items-center gap-1.5 text-xs">
                          <Key className="w-4 h-4" /> Access Verification Code *
                        </label>
                        <button type="button" onClick={() => setVerificationCode(role === 'organizer' ? 'ORG-HACKVERSE-2026' : 'JDG-HACKVERSE-2026')} className="text-[10px] font-mono font-bold text-primary hover:underline">
                          Auto-fill Default
                        </button>
                      </div>
                      <Input
                        required
                        placeholder={role === 'organizer' ? 'ORG-HACKVERSE-2026' : 'JDG-HACKVERSE-2026'}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                        className="font-mono text-sm uppercase"
                      />
                      <p className="text-[11px] text-warning/80 mt-2">
                        Default Code: <code className="font-mono font-bold text-foreground bg-surface px-1.5 py-0.5 rounded">{role === 'organizer' ? 'ORG-HACKVERSE-2026' : 'JDG-HACKVERSE-2026'}</code>
                      </p>
                    </div>
                  )}

                  {role === 'participant' && (
                    <>
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">College / University</label>
                        <Input placeholder="e.g. Stanford University" value={college} onChange={(e) => setCollege(e.target.value)} />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Primary Skills (Comma-separated)</label>
                        <Input placeholder="React, Node.js, Solidity, Python" value={skills} onChange={(e) => setSkills(e.target.value)} className="font-mono" />
                      </div>
                    </>
                  )}

                  {role === 'organizer' && (
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Organization / Host Name</label>
                      <Input placeholder="e.g. Developer Club" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
                    </div>
                  )}

                  {role === 'judge' && (
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Expertise / Specialization</label>
                      <Input placeholder="e.g. AI Systems & Smart Contracts" value={expertise} onChange={(e) => setExpertise(e.target.value)} />
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-6">
                    Review Onboarding <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <Card className="p-8 shadow-2xl bg-card/60 backdrop-blur-xl">
                <button onClick={() => setStep(3)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Verification
                </button>

                <h2 className="text-2xl font-extrabold mb-1">Review Registration</h2>
                <p className="text-sm text-foreground-secondary mb-6">Confirm your details before creating your HackVerse account.</p>

                <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 text-sm mb-6 shadow-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Account Type:</span>
                    <span className="font-bold text-primary uppercase font-mono">{role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Full Name:</span>
                    <span className="font-semibold text-foreground">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Email:</span>
                    <span className="font-semibold text-foreground">{email}</span>
                  </div>
                  {(role === 'organizer' || role === 'judge') && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-foreground-secondary">Access Code:</span>
                      <span className="font-mono text-warning font-bold">••••••••</span>
                    </div>
                  )}
                </div>

                <Button variant="primary" disabled={loading} onClick={handleFinalSubmit} className="w-full bg-gradient-to-r from-success to-success-hover hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] border-success/50 transition-all">
                  {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Creating Account...</span> : <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Create {role.toUpperCase()} Account</span>}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: LOADING TRANSITION */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="p-12 text-center shadow-2xl bg-card/80 backdrop-blur-2xl space-y-4">
                <div className="w-16 h-16 rounded-[20px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(182,255,0,0.2)]">
                  <Shield className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="font-extrabold text-xl text-foreground">Creating Your {role.toUpperCase()} Account...</h3>
                <p className="text-sm text-foreground-secondary">Verifying and establishing user record in the Verse.</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Log in to Portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
