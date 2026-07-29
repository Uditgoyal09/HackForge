import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Moon, Sun, Hexagon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('hackverse-theme');
    if (theme === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('hackverse-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('hackverse-theme', 'dark');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'organizer': return '/organizer/dashboard';
      case 'judge': return '/judge/dashboard';
      case 'participant': default: return '/participant/dashboard';
    }
  };
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Hackathons', path: '/hackathons' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Projects', path: '/projects' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-[68px] z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/65 backdrop-blur-xl border-b border-border shadow-2xl'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto h-full px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <Hexagon className="w-8 h-8 text-foreground group-hover:text-primary transition-colors duration-300" />
              <div className="absolute inset-0 bg-primary opacity-10 blur-md group-hover:opacity-30 transition-opacity" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Hack<span className="text-gradient-primary">Verse</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 hover:text-foreground transition-colors rounded-md ${isActive ? 'text-foreground font-semibold' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute inset-0 bg-surface-hover border border-border/50 rounded-md -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Button variant="secondary" size="sm" onClick={() => window.location.href = getDashboardPath()} className="gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-elevated border border-transparent transition-all"
                  >
                    <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-surface border border-border flex items-center justify-center font-bold text-xs text-foreground uppercase shadow-sm group-hover:border-primary/50 transition-colors">
                      {user?.name?.substring(0, 2) || 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-card border border-border backdrop-blur-xl rounded-[14px] shadow-2xl z-50 p-2 text-sm text-foreground overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/50 mb-1">
                          <p className="font-semibold truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          <Badge variant="primary" className="mt-2 text-[9px] px-2">{user?.role}</Badge>
                        </div>
                        <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-surface-elevated transition-colors">
                          <User className="w-4 h-4 text-muted-foreground" /> My Profile
                        </Link>
                        <button onClick={() => { setUserDropdownOpen(false); logout(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-error/10 text-error transition-colors mt-1">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated && <NotificationBell />}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted-foreground hover:text-foreground">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Scroll Progress Line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary origin-left shadow-[0_0_8px_rgba(182,255,0,0.5)]"
          style={{ scaleX }}
        />
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[68px] bg-background/95 backdrop-blur-2xl z-40 p-6 flex flex-col">
          <div className="flex flex-col gap-4 text-lg font-medium text-muted-foreground">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">Home</Link>
            <Link to="/hackathons" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">Explore Hackathons</Link>
            <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">Leaderboard</Link>
            <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground">Projects</Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-surface border border-border flex items-center justify-center font-bold text-foreground">
                    {user?.name?.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
                  </div>
                </div>
                <Button variant="primary" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); window.location.href = getDashboardPath(); }}>
                  Go to Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start text-error hover:bg-error/10 hover:text-error" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
