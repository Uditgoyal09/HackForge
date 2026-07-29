import React from 'react';
// No framer-motion here for better performance
import { cn } from './Button'; // Reusing cn from Button

const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  const baseStyles = "bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden transition-colors duration-200";
  
  if (hoverEffect) {
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          "hover:-translate-y-[3px] hover:border-border-hover hover:bg-surface-hover hover:shadow-card-hover group relative",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-primary-soft opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(baseStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("p-6 flex flex-col space-y-1.5", className)} {...props}>
    {children}
  </div>
);

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-bold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
