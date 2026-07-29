import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Code2, Trophy, ArrowRight } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { id: 'create', label: 'Create Hackathon', icon: Plus, to: '/organizer/hackathons/create', color: 'text-primary' },
    { id: 'apps', label: 'Manage Applications', icon: Users, to: '/organizer', color: 'text-foreground' },
    { id: 'subs', label: 'Review Submissions', icon: Code2, to: '/organizer', color: 'text-success' },
    { id: 'results', label: 'Publish Results', icon: Trophy, to: '/organizer', color: 'text-primary' }
  ];

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-6 shadow-lg h-full flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-6">Quick Actions</h3>
      <div className="space-y-3 flex-1">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.to}
            className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-elevated border border-border hover:bg-surface-hover hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-[var(--radius-sm)] bg-surface ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{action.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
