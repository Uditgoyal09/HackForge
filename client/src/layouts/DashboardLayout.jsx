import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DashboardLayout = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-surface/50 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-text-secondary hover:bg-background rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden sm:flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary w-64">
              <Search className="h-4 w-4 text-text-secondary mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer border border-primary/30">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
