import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

const OrganizerDashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
      <div>
        <h2 className="text-xs font-mono text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Organizer Workspace
        </h2>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-relaxed">
          Manage your hackathons, track event performance, review submissions, and publish results from your central command.
        </p>
      </div>

      <Link to="/organizer/hackathons/create">
        <Button variant="primary" className="px-6 py-3 h-auto">
          <span className="relative flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Create Hackathon
          </span>
        </Button>
      </Link>
    </div>
  );
};

export default OrganizerDashboardHeader;
