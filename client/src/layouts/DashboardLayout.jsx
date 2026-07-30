import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu, Search, Bell, User, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/layout/NotificationBell';

export const DashboardLayout = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const rootPaths = ['/admin/dashboard', '/organizer/dashboard', '/participant/dashboard', '/judge/dashboard'];
  const showBackButton = !rootPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-purple/30">
      
      {/* Background glow for Dashboard */}
      <div className="absolute top-0 left-64 w-[600px] h-[600px] bg-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/60 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors border border-transparent hover:border-border"
                title="Go Back"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            
            <div className="hidden sm:flex items-center relative w-64 group">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple transition-colors" />
              <input 
                type="text" 
                placeholder="Search HackForge..." 
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold">{user?.name || 'User'}</span>
                <Badge variant="primary" className="text-[9px]">{user?.role || 'Guest'}</Badge>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple to-cyan flex items-center justify-center cursor-pointer shadow-md text-white font-bold text-sm">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
