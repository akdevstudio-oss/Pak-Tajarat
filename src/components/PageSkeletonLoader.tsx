import React from 'react';

export const PageSkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse py-4">
      {/* Banner / Hero Skeleton */}
      <div className="w-full h-48 md:h-64 bg-gray-200 dark:bg-zinc-800 rounded-3xl" />

      {/* Title & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>

      {/* Grid of Card Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="w-full h-44 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-24 bg-amber-200 dark:bg-amber-950/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
