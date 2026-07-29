import React from 'react';

const EventStatusBadge = ({ status, registrationStatus }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ongoing':
        return 'bg-success/10 text-success border-success/20';
      case 'completed':
        return 'bg-surface-elevated text-muted-foreground border-border';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'upcoming':
        if (registrationStatus === 'open') {
          return 'bg-primary-soft text-foreground border-primary/20';
        }
        return 'bg-surface text-foreground border-border';
      default:
        return 'bg-surface-elevated text-muted-foreground border-border';
    }
  };

  const getLabel = () => {
    if (status === 'upcoming' && registrationStatus === 'open') {
      return 'REGISTRATION OPEN';
    }
    return status.toUpperCase();
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold tracking-wider border ${getBadgeStyle()}`}>
      {status === 'ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
      {getLabel()}
    </span>
  );
};

export default EventStatusBadge;
