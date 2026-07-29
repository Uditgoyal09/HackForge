import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Home, Search } from 'lucide-react';

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground text-center">
      <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary shadow-xl shadow-primary/5">
        <Terminal className="w-10 h-10" />
      </div>

      <span className="text-xs font-mono tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-3">
        404 Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
        Lost in Code Space?
      </h1>

      <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        The route you are trying to reach does not exist or has been moved. Explore hackathons or return to the main dashboard.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/hackathons"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover text-sm font-medium transition-all"
        >
          <Search className="w-4 h-4" /> Explore Hackathons
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-sm font-medium text-primary-foreground transition-all shadow-lg shadow-primary/25"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound404;
