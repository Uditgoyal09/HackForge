import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../ui/Button';
import { LayoutDashboard, Users, Trophy, Settings, Menu, X, Hexagon, Code2, Shield, Calendar, CreditCard, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Config mapped by roles
const roleNavigation = {
  participant: [
    { name: 'Dashboard', href: '/participant/dashboard', icon: LayoutDashboard },
    { name: 'My Hackathons', href: '/participant/hackathons', icon: Trophy },
    { name: 'My Teams', href: '/participant/teams', icon: Users },
    { name: 'My Submissions', href: '/participant/submissions', icon: Code2 },
    { name: 'Settings', href: '/profile', icon: Settings },
  ],
  organizer: [
    { name: 'Dashboard', href: '/organizer/dashboard', icon: LayoutDashboard },
    { name: 'Manage Hackathons', href: '/organizer/hackathons', icon: Calendar },
    { name: 'Registrations', href: '/organizer/registrations', icon: Users },
    { name: 'Review Submissions', href: '/organizer/submissions', icon: Shield },
    { name: 'Settings', href: '/profile', icon: Settings },
  ],
  judge: [
    { name: 'Dashboard', href: '/judge/dashboard', icon: LayoutDashboard },
    { name: 'Evaluate Projects', href: '/judge/evaluations', icon: Trophy },
    { name: 'Settings', href: '/profile', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Platform Stats', href: '/admin/stats', icon: Trophy },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Billing', href: '/admin/billing', icon: CreditCard },
    { name: 'Settings', href: '/profile', icon: Settings },
  ]
};

export const Sidebar = ({ isMobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = user ? (roleNavigation[user.role] || roleNavigation.participant) : roleNavigation.participant;
  
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const DesktopSidebar = () => (
    <div className={cn(
      "hidden lg:flex flex-col border-r border-border bg-card/40 backdrop-blur-3xl transition-all duration-300 z-20 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <Hexagon className="w-8 h-8 text-foreground shrink-0" />
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight text-foreground whitespace-nowrap">
              Hack<span className="text-gradient-primary">Forge</span>
            </span>
          )}
        </Link>
        <button onClick={toggleCollapse} className={cn("p-1.5 hover:bg-surface rounded-lg text-muted-foreground hover:text-foreground transition-colors absolute", isCollapsed ? "right-[-12px] bg-card border border-border rounded-full" : "right-2")}>
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href) && (item.href !== '/profile' || location.pathname === '/profile');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                isActive 
                  ? "bg-primary-soft text-foreground font-semibold" 
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
                isCollapsed && "justify-center px-0"
              )}
            >
              {/* Active Indicator Line */}
              <div className={cn(
                "absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full transition-transform duration-300 origin-center",
                (isActive && !isCollapsed) ? "scale-y-100" : "scale-y-0"
              )} />
              
              <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
              
              {!isCollapsed && <span className="truncate">{item.name}</span>}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border text-foreground text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-error hover:bg-error/10",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col lg:hidden shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-border">
              <Link to="/" className="flex items-center gap-2">
                <Hexagon className="w-7 h-7 text-foreground" />
                <span className="font-extrabold text-lg tracking-tight text-foreground">
                  Hack<span className="text-gradient-primary">Forge</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href) && (item.href !== '/profile' || location.pathname === '/profile');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive 
                        ? "bg-primary-soft text-foreground font-semibold border border-primary/20" 
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
              <button 
                onClick={() => { setMobileOpen(false); logout(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-error hover:bg-error/10 font-medium"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};
