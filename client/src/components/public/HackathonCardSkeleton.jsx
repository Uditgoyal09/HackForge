import React from 'react';

const HackathonCardSkeleton = () => {
  return (
    <div className="flex flex-col h-[400px] bg-surface/50 border border-border rounded-[var(--radius-lg)] overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 w-full bg-surface-elevated relative">
        <div className="absolute top-4 left-4 h-6 w-24 bg-border rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category & Mode */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-20 bg-surface-elevated rounded-[var(--radius-md)]"></div>
          <div className="h-3 w-12 bg-surface-elevated rounded-full"></div>
        </div>

        {/* Title */}
        <div className="h-6 w-3/4 bg-border rounded-[var(--radius-md)] mb-3"></div>
        
        {/* Description */}
        <div className="h-4 w-full bg-surface-elevated rounded-[var(--radius-md)] mb-2"></div>
        <div className="h-4 w-2/3 bg-surface-elevated rounded-[var(--radius-md)] mb-6"></div>

        {/* Tags */}
        <div className="flex gap-2 mb-auto">
          <div className="h-5 w-16 bg-surface-elevated rounded-full"></div>
          <div className="h-5 w-16 bg-surface-elevated rounded-full"></div>
        </div>

        {/* Stats & Footer */}
        <div className="mt-6 pt-4 border-t border-border/50 flex justify-between">
          <div className="h-4 w-24 bg-surface-elevated rounded-[var(--radius-md)]"></div>
          <div className="h-4 w-16 bg-surface-elevated rounded-[var(--radius-md)]"></div>
        </div>
      </div>
    </div>
  );
};

export default HackathonCardSkeleton;
