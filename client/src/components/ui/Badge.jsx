import React from 'react';
import { cn } from './Button'; // Reusing cn from Button

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono uppercase transition-colors";
  
  const variants = {
    default: "bg-surface-elevated border border-border-hover text-foreground-secondary",
    primary: "bg-primary-soft border border-primary/40 text-primary",
    accent: "bg-foreground text-background", // For high-contrast secondary badges
    success: "bg-success/10 border border-success/30 text-success",
    warning: "bg-warning/10 border border-warning/30 text-warning",
    error: "bg-error/10 border border-error/30 text-error",
    outline: "bg-surface border border-border-hover text-foreground-secondary",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export { Badge };
