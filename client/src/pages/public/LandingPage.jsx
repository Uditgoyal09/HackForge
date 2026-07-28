import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Rocket, Users, Code, Trophy, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { hackathonService } from '../../services/hackathonService';
import HeroCanvas from '../../components/animations/HeroCanvas';
import PhysicsPlayground from '../../components/animations/PhysicsPlayground';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [featuredHackathons, setFeaturedHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await hackathonService.getHackathons({ limit: 3 });
        if (res.success && res.data) {
          setFeaturedHackathons(res.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'organizer': return '/organizer/dashboard';
      case 'judge': return '/judge/dashboard';
      case 'participant': default: return '/participant/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-16 relative overflow-hidden">
      {/* 3D Interactive Hero Canvas */}
      <HeroCanvas />

      {/* Hero Content */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Hackathon Management Engine
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
        >
          WHERE IDEAS <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            BECOME INNOVATIONS.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Build. Compete. Innovate. HackVerse empowers developers to team up, submit projects, and compete on transparent leaderboards with real-time judging.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/hackathons"
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
          >
            Explore Hackathons <ArrowRight className="w-4 h-4" />
          </Link>

          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Join Ecosystem
            </Link>
          )}
        </motion.div>
      </section>

      {/* Featured Hackathons Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-900">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Hackathons</h2>
            <p className="text-sm text-slate-400 mt-1">Discover active and upcoming competitions worldwide.</p>
          </div>
          <Link to="/hackathons" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : featuredHackathons.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No Active Hackathons</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon or explore past competitions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHackathons.map((h) => (
              <div
                key={h._id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold uppercase">
                      {h.mode || 'Online'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      ${h.prizePool?.toLocaleString() || '0'} Prize Pool
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors mb-2">
                    {h.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {h.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Max Team: {h.maxTeamSize} members
                  </span>
                  <Link
                    to={`/hackathons/${h._id}`}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold">How HackVerse Works</h2>
          <p className="text-sm text-slate-400 mt-2">A seamless end-to-end lifecycle for organizers, participants, and judges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h4 className="font-bold text-white mb-1 text-sm">Register & Team Up</h4>
            <p className="text-xs text-slate-400">Join hackathons solo or form/join teams with email invitations.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h4 className="font-bold text-white mb-1 text-sm">Build & Submit</h4>
            <p className="text-xs text-slate-400">Submit GitHub repos, live demos, and presentation PDFs before deadline.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h4 className="font-bold text-white mb-1 text-sm">Transparent Judging</h4>
            <p className="text-xs text-slate-400">Assigned judges evaluate custom criteria with server-side total score verification.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              4
            </div>
            <h4 className="font-bold text-white mb-1 text-sm">Live Leaderboard</h4>
            <p className="text-xs text-slate-400">Rankings published publicly with multi-level tie-breaking and Top 3 podium.</p>
          </div>
        </div>
      </section>

      {/* Matter.js Physics Badge Playground */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <PhysicsPlayground />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 HackVerse. Built for Capstone Excellence.</p>
          <div className="flex gap-6">
            <Link to="/hackathons" className="hover:text-slate-300">Hackathons</Link>
            <Link to="/projects" className="hover:text-slate-300">Projects</Link>
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
