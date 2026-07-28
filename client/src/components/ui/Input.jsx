import { forwardRef } from 'react';
import { cn } from './Button';

const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-error focus-visible:ring-error',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
