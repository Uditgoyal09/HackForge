import React, { forwardRef } from 'react';
import { cn } from './Button'; // Assuming cn is exported from Button

const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface hover:bg-surface-hover hover:border-border-hover focus:bg-surface px-4 py-2 text-sm text-foreground transition-all duration-300 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-error focus-visible:border-error focus-visible:ring-error',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <span className="text-xs text-error mt-1 font-medium">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
