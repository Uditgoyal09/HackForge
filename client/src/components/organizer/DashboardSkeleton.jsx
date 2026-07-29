import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 pb-10">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-surface-elevated rounded-md animate-pulse" />
          <div className="h-10 w-64 bg-surface-elevated rounded-md animate-pulse" />
          <div className="h-12 w-80 bg-surface-elevated rounded-md animate-pulse" />
        </div>
        <div className="h-12 w-48 bg-surface-elevated rounded-[var(--radius-md)] animate-pulse" />
      </div>

      {/* Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-surface border border-border rounded-[var(--radius-lg)] animate-pulse p-6 flex flex-col justify-between">
            <div className="h-4 w-24 bg-surface-elevated rounded-md" />
            <div className="h-8 w-16 bg-surface-elevated rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="h-[300px] bg-surface border border-border rounded-[var(--radius-lg)] animate-pulse" />
          <div className="space-y-4">
             <div className="h-6 w-48 bg-surface-elevated rounded-md animate-pulse" />
             <div className="h-40 bg-surface border border-border rounded-[var(--radius-lg)] animate-pulse" />
             <div className="h-40 bg-surface border border-border rounded-[var(--radius-lg)] animate-pulse" />
          </div>
        </div>
        <div className="space-y-8">
          <div className="h-64 bg-surface border border-border rounded-[var(--radius-lg)] animate-pulse" />
          <div className="h-64 bg-surface border border-border rounded-[var(--radius-lg)] animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
