// Analytic — customizable workspace (Apply/Cancel + AutoAlign + Expand)
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Period } from './types';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { TopPagesCard } from './components/TopPagesCard';
import { TopPagesModal } from './components/TopPagesModal';
import WorkspaceGrid from '../dashboard/workspace/WorkspaceGrid';
import WorkspaceToolbar from '../dashboard/workspace/WorkspaceToolbar';
import { analyticsRegistry, analyticsDefaults } from '../dashboard/workspace/registry';
import { WidgetIcon } from '../dashboard/workspace/icons';
import { useStore } from '../../store/useStore';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { loading, refreshing, stats, trend, topPages, trafficSources, devices, browsers, countries, bounceRate, avgDuration, dailyAvgDuration, fetchData } = useAnalyticsData(period);
  const { orders } = useStore();
  const {
    analytics: saved, analyticsDraft, analyticsEditMode, analyticsAutoAlign,
    analyticsGridVisible, analyticsPreview,
    hasHydrated, setAnalytics, enterAnalyticsEdit, cancelAnalyticsEdit, applyAnalyticsEdit,
    setAutoAlign, setGridVisible, setPreview, updateWidget, reorderWorkspace, resetWorkspace,
    undo, redo, canUndo, canRedo,
  } = useWorkspaceStore();

  useEffect(() => {
    if (hasHydrated && saved.length === 0) setAnalytics(analyticsDefaults);
  }, [hasHydrated, saved.length, setAnalytics]);

  const effectiveLayouts = useMemo(() => {
    if (analyticsEditMode) return analyticsDraft ?? saved;
    return saved.length ? saved : analyticsDefaults;
  }, [saved, analyticsDraft, analyticsEditMode]);

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
      case 'user-behavior': return <UserBehavior pages={topPages} period={period} />;
      case 'product-analytics': return <ProductAnalytics pages={topPages} />;
      case 'customer-analytics': return <CustomerAnalytics visitorNew={visitorTotals.unique} visitorReturning={visitorTotals.returning} />;
      case 'geographic-analytics': return <GeographicAnalytics countries={countries} />;
      case 'top-pages': return <TopPagesCard pages={topPages} period={period} onViewAll={() => setShowAllPages(true)} />;
      case 'session-quality': return <SessionQuality bounceRate={bounceRate} avgDuration={avgDuration} stats={stats} />;
      case 'peak-hours': return <PeakHoursHeatmap period={period} orders={orders} />;
      case 'search-behavior': return <SearchBehavior period={period} />;
      default: return null;
    }
  };

  const skeletonFor = () => <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse h-[280px]"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mb-3" /><div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-48 mb-2" /><div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl" /></div>;

  const expandedNode = (() => {
    if (!expandedId) return null;
    if (expandedId === 'user-behavior') return <UserBehavior pages={topPages} period={period} isExpanded />;
    if (expandedId === 'visitor-trends') return <VisitorTrends trend={trend} isExpanded />;
    if (expandedId === 'conversion-funnel') return <ConversionFunnel stats={stats} period={period} isExpanded />;
    if (expandedId === 'traffic-performance') return <TrafficPerformance sources={trafficSources} isExpanded />;
    if (expandedId === 'device-analytics') return <DeviceAnalytics devices={devices} browsers={browsers} isExpanded />;
    if (expandedId === 'session-quality') return <SessionQuality bounceRate={bounceRate} avgDuration={avgDuration} stats={stats} isExpanded />;
    if (expandedId === 'product-analytics') return <ProductAnalytics pages={topPages} isExpanded />;
    if (expandedId === 'customer-analytics') return <CustomerAnalytics visitorNew={visitorTotals.unique} visitorReturning={visitorTotals.returning} isExpanded />;
    if (expandedId === 'top-pages') return <TopPagesCard pages={topPages} period={period} onViewAll={() => setShowAllPages(true)} isExpanded />;
    if (expandedId === 'peak-hours') return <PeakHoursHeatmap period={period} orders={orders} isExpanded />;
    if (expandedId === 'geographic-analytics') return <GeographicAnalytics countries={countries} isExpanded />;
    if (expandedId === 'search-behavior') return <SearchBehavior period={period} isExpanded />;
    return renderWidget(expandedId);
  })();
  const expandedMeta = expandedId ? analyticsRegistry.find(r => r.id === expandedId) : null;

  return (
    <div className="space-y-4">
      <AnalyticsHeader period={period} setPeriod={setPeriod} refreshing={refreshing} onRefresh={() => fetchData(true)} />
      <WorkspaceToolbar
        workspace="analytics"
        editMode={analyticsEditMode}
        autoAlign={analyticsAutoAlign}
        gridVisible={analyticsGridVisible}
        preview={analyticsPreview}
        onEnterEdit={enterAnalyticsEdit}
        onCancel={cancelAnalyticsEdit}
        onApply={applyAnalyticsEdit}
        onToggleAutoAlign={v => setAutoAlign('analytics', v)}
        onToggleGrid={v => setGridVisible('analytics', v)}
        onTogglePreview={v => setPreview('analytics', v)}
        onUndo={() => undo('analytics')}
        onRedo={() => redo('analytics')}
        canUndo={canUndo('analytics')}
        canRedo={canRedo('analytics')}
        registry={analyticsRegistry}
        layouts={effectiveLayouts}
        onShow={id => updateWidget('analytics', id, { visible: true })}
        onReset={() => resetWorkspace('analytics', analyticsDefaults)}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <WorkspaceGrid
          registry={analyticsRegistry}
          layouts={effectiveLayouts}
          editMode={analyticsEditMode}
          autoAlign={analyticsAutoAlign}
          gridVisible={analyticsGridVisible}
          preview={analyticsPreview}
          onReorder={ids => reorderWorkspace('analytics', ids)}
          onToggleLock={id => {
            const cur = effectiveLayouts.find(w => w.id === id);
            if (cur) updateWidget('analytics', id, { locked: !cur.locked });
          }}
          onRemove={id => updateWidget('analytics', id, { visible: false })}
          onChangeSpan={(id, span) => updateWidget('analytics', id, { colSpan: span })}
          onChangeRowSpan={(id, span) => updateWidget('analytics', id, { rowSpan: span as any })}
          onChangeCustomHeight={(id, px) => updateWidget('analytics', id, { customHeight: px })}
          onChangeCustomWidth={(id, px) => updateWidget('analytics', id, { customWidth: px })}
          onExpand={id => setExpandedId(id)}
          renderWidget={renderWidget}
        />
      )}

      <TopPagesModal open={showAllPages} onClose={() => setShowAllPages(false)} pages={topPages} period={period} />

      {expandedId && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setExpandedId(null)} />
          <div className="relative flex-1 flex flex-col max-h-screen p-3 sm:p-4 lg:p-6 overflow-hidden">
            <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
              <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-darkGreen)]/10 border border-[var(--color-darkGreen)]/10 flex items-center justify-center shrink-0">
                  <WidgetIcon id={expandedId} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{expandedMeta?.name ?? expandedId}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{expandedMeta?.description}</p>
                </div>
                <button onClick={() => setExpandedId(null)} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-6 bg-gray-50/30 dark:bg-white/[0.01]">
                <div className="min-h-full">
                  {expandedNode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytic;
