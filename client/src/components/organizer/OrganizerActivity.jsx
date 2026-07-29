import React from 'react';

const OrganizerActivity = ({ activity }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-6 shadow-lg h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-[var(--radius-md)] bg-surface-elevated flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-foreground">No recent activity yet</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Activity will appear here once participants start interacting with your events.
        </p>
      </div>
    );
  }

  const getTimeAgo = (dateStr) => {
    const diff = (new Date() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'registration': return 'text-primary bg-primary-soft border-primary/20';
      case 'team': return 'text-foreground bg-surface-elevated border-border';
      case 'submission': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-surface-elevated border-border';
    }
  };

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-6 shadow-lg h-full">
      <h3 className="text-sm font-semibold text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activity.map((item, index) => (
          <div key={`${item.id}-${index}`} className="relative flex gap-4">
            {index !== activity.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-border" />
            )}
            <div className={`relative z-10 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${getIconColor(item.type)}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
            <div>
              <p className="text-xs text-foreground leading-relaxed mb-0.5">{item.message}</p>
              <p className="text-[10px] text-muted-foreground">{getTimeAgo(item.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerActivity;
