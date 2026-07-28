import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, Menu, X, LogOut, LayoutDashboard, User, Shield, Trophy, FolderGit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav
      className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-slate-950/50'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Terminal className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white font-mono">
            Hack<span className="text-indigo-400">Verse</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link
            to="/hackathons"
            className={`hover:text-white transition-colors ${
              location.pathname === '/hackathons' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Explore
          </Link>

          <Link
            to="/projects"
            className={`hover:text-white transition-colors ${
              location.pathname === '/projects' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Projects
          </Link>
        </div>

        {/* Desktop User / Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />

              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition-all"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-md shadow-indigo-500/10">
                    {user?.name?.substring(0, 2) || 'U'}
                  </div>
                </button>

                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-sm text-slate-200">
                      <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                        <p className="font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          {isAuthenticated && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-6 space-y-4 shadow-2xl text-slate-200">
          <Link
            to="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium hover:text-indigo-400 py-1"
          >
            Explore Hackathons
          </Link>
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium hover:text-indigo-400 py-1"
          >
            Public Projects
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white">
                  {user?.name?.substring(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.role?.toUpperCase()}</p>
                </div>
              </div>

              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium justify-center text-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 w-full py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium justify-center text-sm"
              >
                <User className="w-4 h-4" /> Edit Profile
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full py-2 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium justify-center text-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/25"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
