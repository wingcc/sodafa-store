// Analytic — customizable workspace
'use client';

import React, { useState, useMemo } from 'react';
import type { Period } from './types';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { TopPagesCard } from './components/TopPagesCard';
import { TopPagesModal } from './components/TopPagesModal';
import WorkspaceGrid from '../dashboard/workspace/WorkspaceGrid';
import WorkspaceToolbar from '../dashboard/workspace/WorkspaceToolbar';
import { analyticsRegistry, analyticsDefaults } from '../dashboard/workspace/registry';

// Analytics widgets
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
import { useEffect } from 'react';

const Analytic: React.FC = () => {
  const [period, setPeriod] = useState<Period>('7d');
  const [showAllPages, setShowAllPages] = useState(false);
  const { loading, refreshing, stats, trend, topPages, trafficSources, devices, browsers, countries, bounceRate, avgDuration, dailyAvgDuration, fetchData } = useAnalyticsData(period);
  const { analytics: layouts, analyticsEditMode, setAnalytics, toggleAnalyticsEdit, updateWidget, reorderWorkspace, resetWorkspace, hasHydrated } = useWorkspaceStore();

  useEffect(() => {
    if (hasHydrated && layouts.length === 0) setAnalytics(analyticsDefaults);
  }, [hasHydrated, layouts.length, setAnalytics]);

  const visitorTotals = useMemo(() => {
    const unique = trend.reduce((a, t) => a + t.uniqueVisitors, 0);
    const returning = trend.reduce((a, t) => a + t.returningVisitors, 0);
    return { unique, returning };
  }, [trend]);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'analytics-overview': return <AnalyticsOverview stats={stats} trend={trend} bounceRate={bounceRate} avgDuration={avgDuration} dailyAvgDuration={dailyAvgDuration} />;
      case 'visitor-trends': return <VisitorTrends trend={trend} />;
      case 'conversion-funnel': return <ConversionFunnel stats={stats} period={period} />;
      case 'cart-abandonment': return <CartAbandonment stats={stats} period={period} />;
      case 'traffic-performance': return <TrafficPerformance sources={trafficSources} />;
      case 'device-analytics': return <DeviceAnalytics devices={devices} browsers={browsers} />;
      case 'user-behavior': return <UserBehavior pages={topPages} />;
      case 'product-analytics': return <ProductAnalytics pages={topPages} />;
      case 'customer-analytics': return <CustomerAnalytics visitorNew={visitorTotals.unique} visitorReturning={visitorTotals.returning} />;
      case 'geographic-analytics': return <GeographicAnalytics countries={countries} />;
      case 'top-pages': return <TopPagesCard pages={topPages} period={period} onViewAll={() => setShowAllPages(true)} />;
      case 'session-quality': return <SessionQuality bounceRate={bounceRate} avgDuration={avgDuration} stats={stats} />;
      case 'peak-hours': return <PeakHoursHeatmap period={period} />;
      case 'search-behavior': return <SearchBehavior />;
      default: return null;
    }
  };

  const skeletonFor = (id: string) => {
    const h = id === 'analytics-overview' ? 'h-[280px]' : id.includes('trend') || id.includes('funnel') ? 'h-[360px]' : 'h-[300px]';
    return <div className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse ${h}`}><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mb-3" /><div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-48 mb-2" /><div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl" /></div>;
  };

  const effectiveLayouts = layouts.length ? layouts : analyticsDefaults;

  return (
    <div className="space-y-6">
      <AnalyticsHeader period={period} setPeriod={setPeriod} refreshing={refreshing} onRefresh={() => fetchData(true)} />
      <WorkspaceToolbar
        editMode={analyticsEditMode}
        onToggleEdit={toggleAnalyticsEdit}
        registry={analyticsRegistry}
        layouts={effectiveLayouts}
        onShow={(id) => updateWidget('analytics', id, { visible: true })}
        onReset={() => resetWorkspace('analytics', analyticsDefaults)}
      />

      {loading ? (
        <div className="grid grid-cols-12 gap-4">
          {effectiveLayouts.filter(l => l.visible).map(l => (
            <div key={l.id} className={`col-span-12 ${l.colSpan === 12 ? 'lg:col-span-12' : l.colSpan === 9 ? 'lg:col-span-9' : l.colSpan === 6 ? 'lg:col-span-6' : 'lg:col-span-3'} md:col-span-6`}>
              {skeletonFor(l.id)}
            </div>
          ))}
        </div>
      ) : (
        <WorkspaceGrid
          registry={analyticsRegistry}
          layouts={effectiveLayouts}
          editMode={analyticsEditMode}
          onReorder={(ids) => reorderWorkspace('analytics', ids)}
          onToggleLock={(id) => {
            const cur = effectiveLayouts.find(w => w.id === id);
            if (cur) updateWidget('analytics', id, { locked: !cur.locked });
          }}
          onHide={(id) => updateWidget('analytics', id, { visible: false })}
          onChangeSpan={(id, span) => updateWidget('analytics', id, { colSpan: span })}
          renderWidget={renderWidget}
        />
      )}

      <TopPagesModal open={showAllPages} onClose={() => setShowAllPages(false)} pages={topPages} period={period} />
    </div>
  );
};

export default Analytic;
