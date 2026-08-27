// Analytic — orchestrator (clean composition)
// Data: hooks/useAnalyticsData  |  Types: ./types  |  UI: ./components/* + ./analytics/*

'use client';

import React, { useState, useMemo } from 'react';
import type { Period } from './types';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { TopPagesCard } from './components/TopPagesCard';
import { TopPagesModal } from './components/TopPagesModal';

// New analytics architecture
import AnalyticsOverview from './analytics/AnalyticsOverview';
import VisitorTrends from './analytics/VisitorTrends';
import ConversionFunnel from './analytics/ConversionFunnel';
import CartAbandonment from './analytics/CartAbandonment';
import TrafficPerformance from './analytics/TrafficPerformance';
import ProductAnalytics from './analytics/ProductAnalytics';
import CustomerAnalytics from './analytics/CustomerAnalytics';
import GeographicAnalytics from './analytics/GeographicAnalytics';
import DeviceAnalytics from './analytics/DeviceAnalytics';
import SessionQuality from './analytics/SessionQuality';
import UserBehavior from './analytics/UserBehavior';
import PeakHoursHeatmap from './analytics/PeakHoursHeatmap';
import SearchBehavior from './analytics/SearchBehavior';

const Analytic: React.FC = () => {
  const [period, setPeriod] = useState<Period>('7d');
  const [showAllPages, setShowAllPages] = useState(false);
  const { loading, refreshing, stats, trend, topPages, trafficSources, devices, browsers, countries, bounceRate, avgDuration, dailyAvgDuration, fetchData } =
    useAnalyticsData(period);

  const visitorTotals = useMemo(() => {
    const unique = trend.reduce((a, t) => a + t.uniqueVisitors, 0);
    const returning = trend.reduce((a, t) => a + t.returningVisitors, 0);
    return { unique, returning };
  }, [trend]);

  return (
    <div className="space-y-6">
      {/* 1 Header */}
      <AnalyticsHeader period={period} setPeriod={setPeriod} refreshing={refreshing} onRefresh={() => fetchData(true)} />

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse h-[160px]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse h-[360px]" />
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse h-[360px]" />
          </div>
        </>
      ) : (
        <>
          {/* 2 Analytics Overview */}
          <AnalyticsOverview stats={stats} trend={trend} bounceRate={bounceRate} avgDuration={avgDuration} dailyAvgDuration={dailyAvgDuration} />

          {/* 3 Visitor Trends */}
          <VisitorTrends trend={trend} />

          {/* 4 Conversion Funnel + 6 Cart Abandonment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConversionFunnel stats={stats} period={period} />
            <CartAbandonment stats={stats} period={period} />
          </div>

          {/* 5 Traffic & Acquisition + Device */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TrafficPerformance sources={trafficSources} />
            </div>
            <DeviceAnalytics devices={devices} browsers={browsers} />
          </div>

          {/* 7 User Behavior */}
          <UserBehavior pages={topPages} />

          {/* 8 Product Analytics */}
          <ProductAnalytics pages={topPages} />

          {/* 9 Customer Analytics */}
          <CustomerAnalytics visitorNew={visitorTotals.unique} visitorReturning={visitorTotals.returning} />

          {/* 10 Geographic */}
          <GeographicAnalytics countries={countries} />

          {/* Preserve Top Pages (existing) — still valuable for quick look */}
          <TopPagesCard pages={topPages} period={period} onViewAll={() => setShowAllPages(true)} />

          {/* 12 Session Quality */}
          <SessionQuality bounceRate={bounceRate} avgDuration={avgDuration} stats={stats} />

          {/* 13 Peak Hours */}
          <PeakHoursHeatmap period={period} />

          {/* 13b Search */}
          <SearchBehavior />
        </>
      )}

      <TopPagesModal open={showAllPages} onClose={() => setShowAllPages(false)} pages={topPages} period={period} />
    </div>
  );
};

export default Analytic;
