import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BackButton = ({ fallbackRoute, label = 'Back', unsavedChanges = false, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getFallback = () => {
    if (fallbackRoute) return fallbackRoute;
    
    const path = location.pathname;
    
    // Public contextual fallbacks
    if (path.startsWith('/hackathons/')) return '/hackathons';
    if (path.startsWith('/projects/')) return '/projects';
    if (path.startsWith('/profile') || path.startsWith('/notifications')) return '/';

    // Role-based fallbacks
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'organizer': return '/organizer/dashboard';
      case 'judge': return '/judge/dashboard';
      case 'participant': return '/participant/dashboard';
      default: return '/';
    }
  };

  const handleBack = () => {
    if (unsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }

    // If the user arrived here from within the app, go back.
    // window.history.length > 2 is a heuristic. location.key !== 'default' is React Router specific.
    if (window.history.length > 2 || (location.key && location.key !== 'default')) {
      navigate(-1);
    } else {
      // Direct load or fresh tab fallback
      navigate(getFallback());
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group flex w-fit items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-[var(--radius-md)] bg-surface/50 hover:bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label="Go back"
      title="Go Back"
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-primary" />
      <span className="transition-colors duration-200 group-hover:text-foreground">{label}</span>
    </button>
  );
};

export default BackButton;
