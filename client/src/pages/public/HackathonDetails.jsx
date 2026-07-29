import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, ShieldCheck, Clock, MapPin, ExternalLink, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { hackathonService } from '../../services/hackathonService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const HackathonDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  
  const [showRegModal, setShowRegModal] = useState(false);
  const [regData, setRegData] = useState({
    name: user?.name || '',
    teamName: '',
    github: '',
    linkedin: ''
  });

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await hackathonService.getHackathonById(id);
      if (res.success && res.data) {
        setHackathon(res.data);
      }
    } catch (err) {
      toast.error('Failed to load hackathon details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistration = async () => {
    if (!isAuthenticated || user?.role !== 'participant') return;
    try {
      const res = await registrationService.getMyRegistrations();
      if (res.success && res.data) {
        const match = res.data.find(r => r.hackathon?._id === id || r.hackathon === id);
        setUserRegistration(match || null);
      }
    } catch {
      // Ignore error
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchUserRegistration();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!hackathon?.registrationDeadline) return;

    const interval = setInterval(() => {
      const target = new Date(hackathon.registrationDeadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hackathon]);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegData(prev => ({ ...prev, name: user?.name || '' }));
    setShowRegModal(true);
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await registrationService.registerForHackathon(id, regData);
      if (res.success) {
        toast.success('Successfully registered for hackathon!');
        fetchUserRegistration();
        setShowRegModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-64 rounded-[var(--radius-lg)] bg-surface/60 border border-border/80 animate-pulse" />
        <div className="h-40 rounded-[var(--radius-lg)] bg-surface/60 border border-border/80 animate-pulse" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 text-center p-6">
        <h2 className="text-2xl font-bold">Hackathon Not Found</h2>
        <Link to="/hackathons" className="mt-4 inline-block text-primary hover:underline">
          Return to Hackathons list
        </Link>
      </div>
    );
  }

  const isOrganizerOwner = user && (user.role === 'admin' || (user.role === 'organizer' && (hackathon.organizer?._id === user._id || hackathon.organizer === user._id)));
  const isRegOpen = (hackathon.registrationStatus === 'open' || !hackathon.registrationStatus) && new Date() < new Date(hackathon.registrationDeadline);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* Cinematic Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] bg-surface border-b border-border overflow-hidden">
        {hackathon.bannerImageUrl ? (
          <img 
            src={hackathon.bannerImageUrl} 
            alt={hackathon.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface to-primary/5 opacity-80" />
        )}
        
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        {/* Content Container aligned at bottom */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end pb-12 z-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase backdrop-blur-md">
                {hackathon.mode || 'Online'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-mono font-bold uppercase backdrop-blur-md">
                {hackathon.status || 'Active'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-xl">
              {hackathon.title}
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl drop-shadow-md">
              {hackathon.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-6 relative z-20">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-4 p-6 bg-surface-elevated/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl mb-12">
              {userRegistration ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success/10 text-success border border-success/30 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Registration Status: {userRegistration.status?.toUpperCase()}
                  </span>

                  {userRegistration.status === 'approved' && (
                    <Link
                      to="/participant/teams"
                      className="px-5 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-lg shadow-primary/25"
                    >
                      Team & Submissions →
                    </Link>
                  )}
                </div>
              ) : isRegOpen ? (
                <button
                  onClick={handleRegisterClick}
                  disabled={registering}
                  className="px-8 py-3 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow-xl shadow-primary/30 disabled:opacity-50"
                >
                  {registering ? 'Processing...' : 'Register for Hackathon'}
                </button>
              ) : (
                <span className="px-4 py-2 rounded-[var(--radius-md)] bg-surface-elevated text-muted-foreground text-xs font-semibold">
                  Registration Closed
                </span>
              )}

              {isOrganizerOwner && (
                <Link
                  to={`/organizer/hackathons/${id}/edit`}
                  className="px-5 py-2.5 rounded-[var(--radius-md)] bg-surface-elevated hover:bg-surface-hover text-foreground font-semibold text-xs transition-all"
                >
                  Manage Event
                </Link>
              )}

              {hackathon.resultsPublished && (
                <Link
                  to={`/hackathons/${id}/leaderboard`}
                  className="px-5 py-2.5 rounded-[var(--radius-md)] bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs transition-all shadow-lg shadow-secondary/25 flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> View Leaderboard
                </Link>
              )}
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline */}
            <div className="bg-surface/50 border border-border/80 rounded-[var(--radius-lg)] p-6 sm:p-8">
              <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Event Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-[var(--radius-md)] bg-background/60 border border-border/50">
                  <p className="text-muted-foreground mb-1">Registration Deadline</p>
                  <p className="font-bold text-foreground text-sm">
                    {new Date(hackathon.registrationDeadline).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-[var(--radius-md)] bg-background/60 border border-border/50">
                  <p className="text-muted-foreground mb-1">Submission Deadline</p>
                  <p className="font-bold text-foreground text-sm">
                    {new Date(hackathon.submissionDeadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Judging Criteria */}
            <div className="bg-surface/50 border border-border/80 rounded-[var(--radius-lg)] p-6 sm:p-8">
              <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Judging Criteria
              </h3>

              {hackathon.judgingCriteria?.length > 0 ? (
                <div className="space-y-4">
                  {hackathon.judgingCriteria.map((c, i) => (
                    <div key={i} className="p-4 rounded-[var(--radius-md)] bg-background/60 border border-border/50 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{c.name}</p>
                        {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
                        Max {c.maxScore} Pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Standard judging rules apply.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Countdown */}
            <div className="bg-surface/60 border border-border/80 rounded-[var(--radius-lg)] p-6 text-center">
              <h4 className="text-xs font-mono tracking-widest text-primary uppercase mb-4">
                Registration Countdown
              </h4>

              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-background rounded-[var(--radius-md)] border border-border">
                  <p className="font-extrabold text-lg text-foreground">{timeLeft.days}</p>
                  <p className="text-[10px] text-muted-foreground">DAYS</p>
                </div>
                <div className="p-2 bg-background rounded-[var(--radius-md)] border border-border">
                  <p className="font-extrabold text-lg text-foreground">{timeLeft.hours}</p>
                  <p className="text-[10px] text-muted-foreground">HRS</p>
                </div>
                <div className="p-2 bg-background rounded-[var(--radius-md)] border border-border">
                  <p className="font-extrabold text-lg text-foreground">{timeLeft.minutes}</p>
                  <p className="text-[10px] text-muted-foreground">MINS</p>
                </div>
                <div className="p-2 bg-background rounded-[var(--radius-md)] border border-border">
                  <p className="font-extrabold text-lg text-foreground">{timeLeft.seconds}</p>
                  <p className="text-[10px] text-muted-foreground">SECS</p>
                </div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-surface/50 border border-border/80 rounded-[var(--radius-lg)] p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-muted-foreground">Prize Pool</span>
                <span className="font-bold text-success text-sm">
                  ${hackathon.prizePool?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-muted-foreground">Max Team Size</span>
                <span className="font-semibold text-foreground">
                  {hackathon.maxTeamSize} Members
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-semibold text-primary uppercase">
                  {hackathon.mode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-foreground mb-2">Registration Form</h2>
            <p className="text-sm text-muted-foreground mb-6">Please provide your details to apply for this hackathon.</p>
            
            <form onSubmit={submitRegistration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regData.name}
                  onChange={(e) => setRegData({...regData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Intended Team Name (Optional)</label>
                <input
                  type="text"
                  value={regData.teamName}
                  onChange={(e) => setRegData({...regData, teamName: e.target.value})}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="e.g. Code Ninjas"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">GitHub Profile Link (Optional)</label>
                <input
                  type="url"
                  value={regData.github}
                  onChange={(e) => setRegData({...regData, github: e.target.value})}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn Profile Link (Optional)</label>
                <input
                  type="url"
                  value={regData.linkedin}
                  onChange={(e) => setRegData({...regData, linkedin: e.target.value})}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-5 py-2.5 rounded-[var(--radius-md)] bg-surface-elevated hover:bg-surface-hover text-foreground font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-6 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {registering ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonDetails;
