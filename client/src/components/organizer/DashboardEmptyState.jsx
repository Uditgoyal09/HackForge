import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Rocket } from 'lucide-react';
import { Button } from '../ui/Button';

const DashboardEmptyState = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-primary-soft rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 w-full h-full bg-surface rounded-full border-2 border-dashed border-border flex items-center justify-center">
          <Rocket className="w-12 h-12 text-primary" />
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
        Launch your first hackathon
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-10 text-sm leading-relaxed">
        Build a competition, invite developers, manage submissions, and publish winners—all from your centralized workspace.
      </p>

      <Link to="/organizer/hackathons/create">
        <Button variant="primary" className="px-8 py-4 h-auto text-base">
          <span className="relative flex items-center gap-2">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create Your First Hackathon
          </span>
        </Button>
      </Link>

      <div className="mt-16 w-full max-w-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 hidden md:block" />
          
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 relative z-10 flex flex-col items-center text-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-surface-hover text-muted-foreground flex items-center justify-center mb-3">
              <span className="text-xs font-bold font-mono">01</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Create Event</h4>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 relative z-10 flex flex-col items-center text-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-surface-hover text-muted-foreground flex items-center justify-center mb-3">
              <span className="text-xs font-bold font-mono">02</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Open Registrations</h4>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 relative z-10 flex flex-col items-center text-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-surface-hover text-muted-foreground flex items-center justify-center mb-3">
              <span className="text-xs font-bold font-mono">03</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Build Teams</h4>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 relative z-10 flex flex-col items-center text-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-surface-hover text-muted-foreground flex items-center justify-center mb-3">
              <span className="text-xs font-bold font-mono">04</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Review Projects</h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardEmptyState;
