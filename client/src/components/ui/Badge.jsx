import React from 'react';
import { cn } from './Button'; // Reusing cn from Button

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono uppercase transition-colors";
  
  const variants = {
    default: "bg-surface border border-border text-foreground",
    primary: "bg-primary-soft border border-primary/20 text-primary-foreground",
    accent: "bg-foreground text-background", // For high-contrast secondary badges
    success: "bg-success/10 border border-success/20 text-success",
    warning: "bg-warning/10 border border-warning/20 text-warning",
    error: "bg-error/10 border border-error/20 text-error",
    outline: "border border-border text-foreground",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export { Badge };
