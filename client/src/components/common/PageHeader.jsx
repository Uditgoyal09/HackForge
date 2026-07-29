import React from 'react';
import BackButton from './BackButton';

const PageHeader = ({ 
  title, 
  description, 
  showBack = false, 
  backLabel = 'Back',
  fallbackRoute,
  unsavedChanges = false,
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {showBack && (
        <div className="mb-4">
          <BackButton 
            label={backLabel} 
            fallbackRoute={fallbackRoute} 
            unsavedChanges={unsavedChanges} 
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
