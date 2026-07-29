import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Key, Activity, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users & RBAC', href: '/admin/users', icon: Users },
    { name: 'Role Access Codes', href: '/admin/access-codes', icon: Key },
    { name: 'Audit Logs', href: '/admin/activity', icon: Activity },
  ];

  const renderNavItems = () => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileOpen?.(false)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-foreground font-semibold border border-primary/20 shadow-sm'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <div className={`shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors duration-200`}>
              <Icon className="w-5 h-5" />
            </div>
            
            {!isCollapsed && (
              <span className={`truncate ${isActive ? '' : 'font-medium'}`}>
                {item.name}
              </span>
            )}

            {isActive && !isCollapsed && (
              <div className="ml-auto w-1 h-5 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[73px] lg:top-auto lg:sticky lg:h-[calc(100vh-73px)] h-[calc(100vh-73px)] bg-surface-elevated border-r border-border z-50 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-[260px]'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden p-4 border-b border-border flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight text-foreground uppercase">Admin Menu</span>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-end p-3">
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {!isCollapsed && (
            <h3 className="px-3 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Administration
            </h3>
          )}
          {renderNavItems()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm font-mono">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </span>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] font-mono text-primary uppercase font-semibold">Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
