import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, ShieldCheck, Clock, MapPin, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
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

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const res = await registrationService.registerForHackathon(id);
      if (res.success) {
        toast.success('Successfully registered for hackathon!');
        fetchUserRegistration();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
        <div className="h-40 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 text-center p-6">
        <h2 className="text-2xl font-bold">Hackathon Not Found</h2>
        <Link to="/hackathons" className="mt-4 inline-block text-indigo-400 hover:underline">
          Return to Hackathons list
        </Link>
      </div>
    );
  }

  const isOrganizerOwner = user && (user.role === 'admin' || (user.role === 'organizer' && hackathon.organizer === user._id));
  const isRegOpen = hackathon.isRegistrationOpen && new Date() < new Date(hackathon.registrationDeadline);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Banner Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-8 sm:p-12 mb-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase">
                {hackathon.mode || 'Online'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase">
                {hackathon.status || 'Active'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              {hackathon.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              {hackathon.description}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/60">
              {userRegistration ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Registration Status: {userRegistration.status?.toUpperCase()}
                  </span>

                  {userRegistration.status === 'approved' && (
                    <Link
                      to="/participant/teams"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25"
                    >
                      Team & Submissions →
                    </Link>
                  )}
                </div>
              ) : isRegOpen ? (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Register for Hackathon'}
                </button>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                  Registration Closed
                </span>
              )}

              {isOrganizerOwner && (
                <Link
                  to={`/organizer/hackathons/${id}/edit`}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
                >
                  Manage Event
                </Link>
              )}

              {hackathon.resultsPublished && (
                <Link
                  to={`/hackathons/${id}/leaderboard`}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-600/25 flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> View Leaderboard
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
              <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Event Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50">
                  <p className="text-slate-500 mb-1">Registration Deadline</p>
                  <p className="font-bold text-slate-200 text-sm">
                    {new Date(hackathon.registrationDeadline).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50">
                  <p className="text-slate-500 mb-1">Submission Deadline</p>
                  <p className="font-bold text-slate-200 text-sm">
                    {new Date(hackathon.submissionDeadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Judging Criteria */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
              <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" /> Judging Criteria
              </h3>

              {hackathon.judgingCriteria?.length > 0 ? (
                <div className="space-y-4">
                  {hackathon.judgingCriteria.map((c, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{c.name}</p>
                        {c.description && <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">
                        Max {c.maxScore} Pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Standard judging rules apply.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Countdown */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 text-center">
              <h4 className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-4">
                Registration Countdown
              </h4>

              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="font-extrabold text-lg text-white">{timeLeft.days}</p>
                  <p className="text-[10px] text-slate-500">DAYS</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="font-extrabold text-lg text-white">{timeLeft.hours}</p>
                  <p className="text-[10px] text-slate-500">HRS</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="font-extrabold text-lg text-white">{timeLeft.minutes}</p>
                  <p className="text-[10px] text-slate-500">MINS</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="font-extrabold text-lg text-white">{timeLeft.seconds}</p>
                  <p className="text-[10px] text-slate-500">SECS</p>
                </div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <span className="text-slate-400">Prize Pool</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ${hackathon.prizePool?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <span className="text-slate-400">Max Team Size</span>
                <span className="font-semibold text-white">
                  {hackathon.maxTeamSize} Members
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mode</span>
                <span className="font-semibold text-indigo-400 uppercase">
                  {hackathon.mode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetails;
