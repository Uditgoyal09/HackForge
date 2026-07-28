import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../ui/Button';
import { LayoutDashboard, Users, Trophy, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock config for roles
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Hackathons', href: '/dashboard/hackathons', icon: Trophy },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar = ({ isMobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const DesktopSidebar = () => (
    <div className={cn(
      "hidden lg:flex flex-col border-r border-border bg-surface transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && <span className="font-bold text-lg">HackVerse</span>}
        <button onClick={toggleCollapse} className="p-2 hover:bg-background rounded-md text-text-secondary">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-background hover:text-text-primary",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 flex flex-col lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <span className="font-bold text-lg">HackVerse</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-text-secondary hover:bg-background hover:text-text-primary"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
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
