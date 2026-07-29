import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const UpcomingDeadlines = ({ deadlines }) => {
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-6 shadow-lg h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-elevated flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">No upcoming deadlines</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Enjoy the calm. You have no urgent dates approaching.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-6 shadow-lg h-full">
      <h3 className="text-sm font-semibold text-foreground mb-6">Upcoming Deadlines</h3>
      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <div key={deadline.id} className={`p-4 rounded-[var(--radius-md)] border ${deadline.urgency === 'high' ? 'bg-warning/10 border-warning/20' : 'bg-surface-elevated border-border'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {deadline.urgency === 'high' ? (
                  <AlertCircle className="w-4 h-4 text-warning" />
                ) : (
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={`text-xs font-semibold ${deadline.urgency === 'high' ? 'text-warning' : 'text-muted-foreground'}`}>
                  {deadline.type}
                </span>
              </div>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">{deadline.hackathon}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {new Date(deadline.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
