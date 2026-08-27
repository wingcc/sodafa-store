// Analytic — orchestrator (small, extensible)
// Data: hooks/useAnalyticsData  |  Types: ./types  |  UI: ./components/*

'use client';

import React, { useState } from 'react';
import type { Period } from './types';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { StatCards } from './components/StatCards';
import { VisitorTrend } from './components/VisitorTrend';
import { AvgSessionDurationCard } from './components/AvgSessionDurationCard';
import { TopPagesCard } from './components/TopPagesCard';
import { TopPagesModal } from './components/TopPagesModal';
import { TrafficSourcesCard } from './components/TrafficSourcesCard';
import { DeviceBreakdownCard } from './components/DeviceBreakdownCard';
import { TopCountriesCard } from './components/TopCountriesCard';
import { SessionQualityCard } from './components/SessionQualityCard';

const Analytic: React.FC = () => {
  const [period, setPeriod] = useState<Period>('7d');
  const [showAllPages, setShowAllPages] = useState(false);
  const { loading, refreshing, stats, trend, topPages, trafficSources, devices, browsers, countries, bounceRate, avgDuration, dailyAvgDuration, fetchData } =
    useAnalyticsData(period);

  return (
    <div className="space-y-6">
      <AnalyticsHeader period={period} setPeriod={setPeriod} refreshing={refreshing} onRefresh={() => fetchData(true)} />

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[350px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[350px]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]" />
          </div>
        </>
      ) : (
        <>
          <StatCards stats={stats} avgDuration={avgDuration} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VisitorTrend trend={trend} />
            <AvgSessionDurationCard data={dailyAvgDuration} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TopPagesCard pages={topPages} period={period} onViewAll={() => setShowAllPages(true)} />
            <TrafficSourcesCard sources={trafficSources} />
            <DeviceBreakdownCard devices={devices} browsers={browsers} />
          </div>

          <TopCountriesCard countries={countries} />
          <SessionQualityCard bounceRate={bounceRate} avgDuration={avgDuration} stats={stats} />
        </>
      )}

      <TopPagesModal open={showAllPages} onClose={() => setShowAllPages(false)} pages={topPages} period={period} />
    </div>
  );
};

export default Analytic;
