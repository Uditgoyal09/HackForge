import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pt-[73px] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header (Only visible on small screens to toggle sidebar) */}
        <div className="lg:hidden p-4 border-b border-border bg-surface-elevated sticky top-[73px] z-30 flex items-center justify-between">
          <span className="font-bold text-sm text-foreground uppercase tracking-wider">Super Admin Portal</span>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -mr-2 rounded-[var(--radius-md)] hover:bg-surface-hover text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Content Outlet */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
