import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Trophy, Users, BookOpen, Briefcase, Award, ArrowRight, ChevronDown, Rocket, Shield, Activity, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hackathonService } from '../../services/hackathonService';
import HeroNetwork from '../../components/home/HeroNetwork';
import FeatureCard from '../../components/home/FeatureCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import HackathonCard from '../../components/public/HackathonCard';
import HackathonCardSkeleton from '../../components/public/HackathonCardSkeleton';
import { MagneticWrapper } from '../../components/ui/MagneticWrapper';
import HowItWorksTimeline from '../../components/home/HowItWorksTimeline';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [featuredHackathons, setFeaturedHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

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

  // Animations based on scroll
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);
  
  const descY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);
  const btnsY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* GLOBAL AMBIENT GLOW */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: useTransform(scrollYProgress, 
            [0, 0.5, 1], 
            [
              "radial-gradient(circle at 50% 30%, rgba(182, 255, 0, 0.08), transparent 45%)",
              "radial-gradient(circle at 20% 50%, rgba(182, 255, 0, 0.05), transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.05), transparent 50%)"
            ]
          )
        }}
      />

      {/* PHASE 01 — ENTER THE VERSE */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-16 z-10">
        <HeroNetwork />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 flex flex-col items-center text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <Badge variant="outline" className="border-primary/30 bg-background/50 backdrop-blur-md px-4 py-1.5 gap-2 text-[11px] text-foreground">
              <Zap className="w-3.5 h-3.5 text-primary" /> BUILD • COMPETE • INNOVATE
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.2rem,7vw,6rem)] font-extrabold tracking-[-0.04em] leading-[1] max-w-5xl mx-auto"
          >
            <span className="text-foreground">Where Ideas</span><br/>
            <motion.span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#D4FF59] to-primary inline-block bg-[length:200%_100%] pr-2"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              Become Innovations.
            </motion.span>
          </motion.h1>

          <motion.div style={{ y: descY }}>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-muted-foreground text-[16px] sm:text-[18px] max-w-[640px] mx-auto leading-[1.65]"
            >
              Discover hackathons, build teams, ship projects and compete with developers around the world.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ y: btnsY }}
          >
            <MagneticWrapper>
              <Link to="/hackathons">
                <motion.button 
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex items-center h-11 px-8 rounded-md bg-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(182,255,0,0.3)] hover:shadow-[0_0_25px_rgba(182,255,0,0.5)] transition-all bg-[length:200%_100%]"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundImage: 'linear-gradient(to right, #B6FF00, #D4FF59, #B6FF00)' }}
                >
                  Explore Hackathons <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </MagneticWrapper>
            
            {isAuthenticated ? (
              <MagneticWrapper>
                <motion.button 
                  whileHover={{ y: -2, borderColor: '#B6FF00', backgroundColor: 'rgba(182, 255, 0, 0.05)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = getDashboardPath()}
                  className="flex items-center h-11 px-8 rounded-md bg-secondary text-secondary-foreground font-semibold border border-transparent transition-all"
                >
                  Go to Dashboard
                </motion.button>
              </MagneticWrapper>
            ) : (
              <MagneticWrapper>
                <Link to="/signup">
                  <motion.button 
                    whileHover={{ y: -2, borderColor: '#B6FF00', backgroundColor: 'rgba(182, 255, 0, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center h-11 px-8 rounded-md bg-secondary text-secondary-foreground font-semibold border border-transparent transition-all"
                  >
                    Host a Hackathon
                  </motion.button>
                </Link>
              </MagneticWrapper>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* PHASE 02 — DISCOVER */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 py-32 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">02 / Discover</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Why participate?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to turn an idea into something real.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            index={1} icon={Code2} 
            title="Build Real Projects" 
            description="Ship working software under a deadline and prove what you can create."
          />
          <FeatureCard 
            index={2} icon={Trophy} 
            title="Win Prizes" 
            description="Compete for real prize pools and recognition on the global leaderboard."
          />
          <FeatureCard 
            index={3} icon={Users} 
            title="Meet Developers" 
            description="Form teams with builders across campuses and across the world."
          />
          <FeatureCard 
            index={4} icon={BookOpen} 
            title="Learn Technologies" 
            description="Pick up a new stack in a single sprint and accelerate your learning."
          />
          <FeatureCard 
            index={5} icon={Briefcase} 
            title="Build Portfolio" 
            description="Every submission becomes public proof of your skills and dedication."
          />
          <FeatureCard 
            index={6} icon={Award} 
            title="Get Recognised" 
            description="Earn certificates, leaderboard positions and winner spotlights."
          />
        </div>
      </section>

      {/* PHASE 03 — FLOW */}
      <section className="relative z-10 w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-4 mt-24"
        >
          <p className="font-mono text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">03 / Flow</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">How it works</h2>
        </motion.div>

        {/* Scroll-Linked Flow Timeline */}
        <HowItWorksTimeline />
      </section>

      {/* PHASE 04 — EXPLORE */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 py-32 lg:px-8 border-t border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">04 / Explore</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Live Opportunities</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/hackathons">
              <Button variant="ghost" className="text-primary hover:text-primary-hover hover:bg-primary/10">View all hackathons →</Button>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <HackathonCardSkeleton key={i} />)}
          </div>
        ) : featuredHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHackathons.map((h, i) => (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <HackathonCard hackathon={h} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-border border-dashed rounded-[var(--radius-xl)] text-center">
            <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-6">
              <Code2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No live hackathons right now</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              New challenges are currently being prepared. Check back soon or host your own hackathon.
            </p>
            <Link to="/signup">
              <Button variant="secondary">Host a Hackathon</Button>
            </Link>
          </div>
        )}
      </section>

      {/* PHASE 07 — JOIN CTA */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 py-40 lg:px-8 overflow-hidden">
        {/* Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center flex flex-col items-center"
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-transparent to-primary mb-8" />
          <Badge variant="outline" className="border-primary/30 bg-primary/5 mb-6 text-primary">YOU'VE SEEN THE VERSE</Badge>
          
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Ready to build <br className="hidden md:block"/>something worth shipping?
          </h2>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Join developers building, competing, and turning ideas into real products. 
            The ecosystem is waiting for your contribution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <MagneticWrapper>
              <Link to="/hackathons" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Explore Hackathons <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </MagneticWrapper>
            {!isAuthenticated && (
              <MagneticWrapper>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full">Create Account</Button>
                </Link>
              </MagneticWrapper>
            )}
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default LandingPage;
