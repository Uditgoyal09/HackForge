import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const Forbidden403 = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground text-center">
      <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-error/10 border border-error/20 flex items-center justify-center mb-6 text-error shadow-xl shadow-error/5 animate-pulse">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-xs font-mono tracking-widest text-error uppercase bg-error/10 border border-error/20 px-3 py-1 rounded-full mb-3">
        403 Access Denied
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
        You Don't Have Permission
      </h1>

      <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        This area is restricted to specific platform roles. If you believe this is an error, please switch accounts or contact the administrator.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

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

export default Forbidden403;
