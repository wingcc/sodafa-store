'use client';

import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-900/90 rounded-xl p-3 sm:p-3.5 border border-gray-100 dark:border-white/10 shadow-xs animate-pulse flex flex-col justify-between h-[120px]">
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 shrink-0" />
          <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-md w-24" />
        </div>
        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-white/10" />
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-2">
        <div className="h-6 bg-gray-200 dark:bg-white/10 rounded-md w-28" />
        <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-12" />
      </div>
      <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-20 mt-1.5" />
    </div>

    <div className="mt-2 pt-1 h-5 flex items-end gap-1">
      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
      <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
      <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
      <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-xs flex-1" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-[300px]' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse flex flex-col ${height}`}>
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-36" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-7 bg-gray-200 dark:bg-white/10 rounded-xl w-20" />
        <div className="h-7 bg-gray-200 dark:bg-white/10 rounded-xl w-20" />
      </div>
    </div>

    <div className="flex-1 bg-gray-50/80 dark:bg-white/5 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center opacity-40 border-b border-dashed border-gray-200 dark:border-white/10 pb-2">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-8" />
        <div className="h-1 bg-gray-200 dark:bg-white/10 rounded flex-1 mx-4" />
      </div>
      <div className="flex justify-between items-center opacity-40 border-b border-dashed border-gray-200 dark:border-white/10 pb-2">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-8" />
        <div className="h-1 bg-gray-200 dark:bg-white/10 rounded flex-1 mx-4" />
      </div>
      <div className="flex justify-between items-center opacity-40 border-b border-dashed border-gray-200 dark:border-white/10 pb-2">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-8" />
        <div className="h-1 bg-gray-200 dark:bg-white/10 rounded flex-1 mx-4" />
      </div>
      <div className="flex justify-between items-center pt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 dark:bg-white/10 rounded w-10" />
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Overview 8 KPI Cards Skeleton Grid */}
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>

    {/* Main Charts & Side Widgets Grid Skeleton */}
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-8">
        <ChartSkeleton height="h-[340px]" />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse h-[340px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-28" />
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 shrink-0" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
