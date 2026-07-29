import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, FolderGit2 } from 'lucide-react';
import { hackathonService } from '../../services/hackathonService';
import HackathonCardSkeleton from '../../components/public/HackathonCardSkeleton';

const GlobalLeaderboards = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedHackathons = async () => {
      setLoading(true);
      try {
        const res = await hackathonService.getHackathons({ status: 'completed', limit: 100 });
        if (res.success && res.data) {
          setHackathons(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch hackathons:", err);
        setHackathons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedHackathons();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 selection:bg-primary/30 selection:text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Fame</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              Select a completed hackathon to view its official leaderboard and winning teams.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[1, 2, 3].map((i) => (
              <HackathonCardSkeleton key={i} />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-surface/30 border border-border rounded-3xl p-8 max-w-md mx-auto backdrop-blur-sm relative z-10"
          >
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg text-foreground mb-2">No Leaderboards Available</h3>
            <p className="text-sm text-muted-foreground">
              There are currently no completed hackathons with published leaderboards.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {hackathons.map((h, i) => (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative flex flex-col h-full bg-surface border border-border hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(182,255,0,0.15)]"
              >
                <div className="relative h-32 w-full overflow-hidden bg-surface-elevated">
                  <img 
                    src={h.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"} 
                    alt={h.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-100 z-10" />
                </div>
                
                <div className="flex flex-col flex-grow p-6 pt-0 relative z-20 -mt-6">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors mb-2 leading-tight truncate">
                    {h.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-grow mb-6">
                    {h.shortDescription || h.description}
                  </p>
                  
                  <Link 
                    to={`/hackathons/${h.slug || h._id}/leaderboard`}
                    className="w-full py-2.5 rounded-[var(--radius-md)] bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Trophy className="w-4 h-4" /> View Leaderboard
                    <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLeaderboards;
