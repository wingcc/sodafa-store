// SODFA MARKETPLACE - Dashboard Overview (Customizable Workspace — Apply/Cancel + AutoAlign)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useTranslation } from '../i18n/useTranslation';
import DashboardHeader from './dashboard/DashboardHeader';
import KpiGrid from './dashboard/KpiGrid';
import RevenueOverview from './dashboard/RevenueOverview';
import SalesByCategoryCard from './dashboard/SalesByCategoryCard';
import OrdersPerformance from './dashboard/OrdersPerformance';
import AovCard from './dashboard/AovCard';
import CodPerformance from './dashboard/CodPerformance';
import InventoryHealth from './dashboard/InventoryHealth';
import CustomerSnapshot from './dashboard/CustomerSnapshot';
import RecentOrdersCard from './dashboard/RecentOrdersCard';
import TopProductsCard from './dashboard/TopProductsCard';
import PendingActionsCard from './dashboard/PendingActionsCard';
import LowStockAlertsCard from './dashboard/LowStockAlertsCard';
import QuickActions from './dashboard/QuickActions';
import OrdersTimelineCard from './dashboard/OrdersTimelineCard';
import WorkspaceGrid from './dashboard/workspace/WorkspaceGrid';
import WorkspaceToolbar from './dashboard/workspace/WorkspaceToolbar';
import { dashboardRegistry, dashboardDefaults } from './dashboard/workspace/registry';
import { WidgetIcon } from './dashboard/workspace/icons';
import DashboardSkeleton from '../components/ui/DashboardSkeleton';

const Dashboard: React.FC = () => {
  const { products, orders, customers, isLoadingProducts, isLoadingOrders, isLoadingCustomers, fetchProducts, fetchOrders, fetchCustomers } = useStore();
  const { t } = useTranslation();
  const {
    dashboard, dashboardDraft, dashboardEditMode, dashboardAutoAlign,
    dashboardGridVisible, dashboardPreview,
    hasHydrated, setDashboard, enterDashboardEdit, cancelDashboardEdit, applyDashboardEdit,
    setAutoAlign, setGridVisible, setPreview, updateWidget, reorderWorkspace, resetWorkspace,
    undo, redo, canUndo, canRedo,
  } = useWorkspaceStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isLoading = isLoadingProducts || isLoadingOrders || isLoadingCustomers;

  const handleRefreshAll = async () => { await Promise.all([fetchProducts(), fetchOrders(), fetchCustomers()]); };

  useEffect(() => { fetchProducts(); fetchOrders(); fetchCustomers(); }, [fetchProducts, fetchOrders, fetchCustomers]);

  useEffect(() => {
    if (hasHydrated) {
      if (dashboard.length === 0) {
        setDashboard(dashboardDefaults);
      } else {
        const existingIds = new Set(dashboard.map(w => w.id));
        const missing = dashboardDefaults.filter(d => !existingIds.has(d.id));
        if (missing.length > 0) {
          setDashboard([...dashboard, ...missing]);
        }
      }
    }
  }, [hasHydrated, dashboard, setDashboard]);

  const effectiveLayouts = useMemo(() => {
    if (dashboardEditMode) return dashboardDraft ?? dashboard;
    return dashboard.length ? dashboard : dashboardDefaults;
  }, [dashboard, dashboardDraft, dashboardEditMode]);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const paidRevenue = useMemo(() => orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0), [orders]);
  const pendingPayments = useMemo(() => orders.filter(o => o.paymentStatus === 'pending'), [orders]);
  const pendingRevenue = useMemo(() => pendingPayments.reduce((s, o) => s + o.total, 0), [pendingPayments]);
  const refunded = useMemo(() => orders.filter(o => o.orderStatus === 'refunded').reduce((s, o) => s + o.total, 0), [orders]);
  const refundedCount = useMemo(() => orders.filter(o => o.orderStatus === 'refunded').length, [orders]);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'kpi-grid': return <KpiGrid orders={orders} products={products} customers={customers} totalRevenue={totalRevenue} paidRevenue={paidRevenue} pendingRevenue={pendingRevenue} refunded={refunded} pendingCount={pendingPayments.length} refundedCount={refundedCount} />;
      case 'revenue-overview': return <RevenueOverview />;
      case 'orders-performance': return <OrdersPerformance orders={orders} />;
      case 'aov': return <AovCard orders={orders} />;
      case 'cod-performance': return <CodPerformance orders={orders} />;
      case 'inventory-health': return <InventoryHealth products={products} />;
      case 'sales-by-category': return <SalesByCategoryCard />;
      case 'customer-snapshot': return <CustomerSnapshot customers={customers} />;
      case 'recent-orders': return <RecentOrdersCard orders={orders} />;
      case 'top-products': return <TopProductsCard products={products} />;
      case 'low-stock': return <LowStockAlertsCard products={products} />;
      case 'pending-actions': return <PendingActionsCard orders={orders} />;
      case 'quick-actions': return <QuickActions />;
      case 'orders-timeline': return <OrdersTimelineCard />;
      default: return null;
    }
  };

  const skeletonFor = (id: string) => {
    const h = id === 'kpi-grid' ? 'h-[200px]' : id === 'revenue-overview' ? 'h-[340px]' : id === 'quick-actions' ? 'h-[160px]' : 'h-[280px]';
    return <div className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse ${h}`}><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mb-3" /><div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-48 mb-2" /><div className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl" /></div>;
  };

  if (isLoading && !hasHydrated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: 'var(--color-darkGreen, #047857)' }} />
          <p className="text-gray-500 dark:text-gray-400">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const expandedNode = (() => {
    if (!expandedId) return null;
    if (expandedId === 'revenue-overview') return <RevenueOverview isExpanded />;
    if (expandedId === 'orders-performance') return <OrdersPerformance orders={orders} isExpanded />;
    if (expandedId === 'cod-performance') return <CodPerformance orders={orders} isExpanded />;
    if (expandedId === 'customer-snapshot') return <CustomerSnapshot customers={customers} isExpanded />;
    if (expandedId === 'aov') return <AovCard orders={orders} isExpanded />;
    if (expandedId === 'inventory-health') return <InventoryHealth products={products} isExpanded />;
    if (expandedId === 'sales-by-category') return <SalesByCategoryCard isExpanded />;
    if (expandedId === 'recent-orders') return <RecentOrdersCard orders={orders} isExpanded />;
    if (expandedId === 'low-stock') return <LowStockAlertsCard products={products} isExpanded />;
    if (expandedId === 'pending-actions') return <PendingActionsCard orders={orders} isExpanded />;
    if (expandedId === 'top-products') return <TopProductsCard products={products} isExpanded />;
    return renderWidget(expandedId);
  })();
  const expandedMeta = expandedId ? dashboardRegistry.find(r => r.id === expandedId) : null;

  return (
    <div className="space-y-4">
      <DashboardHeader onRefresh={handleRefreshAll} isLoading={isLoading} />
      <WorkspaceToolbar
        workspace="dashboard"
        editMode={dashboardEditMode}
        autoAlign={dashboardAutoAlign}
        gridVisible={dashboardGridVisible}
        preview={dashboardPreview}
        onEnterEdit={enterDashboardEdit}
        onCancel={cancelDashboardEdit}
        onApply={applyDashboardEdit}
        onToggleAutoAlign={v => setAutoAlign('dashboard', v)}
        onToggleGrid={v => setGridVisible('dashboard', v)}
        onTogglePreview={v => setPreview('dashboard', v)}
        onUndo={() => undo('dashboard')}
        onRedo={() => redo('dashboard')}
        canUndo={canUndo('dashboard')}
        canRedo={canRedo('dashboard')}
        registry={dashboardRegistry}
        layouts={effectiveLayouts}
        onShow={id => updateWidget('dashboard', id, { visible: true })}
        onReset={() => resetWorkspace('dashboard', dashboardDefaults)}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <WorkspaceGrid
          registry={dashboardRegistry}
          layouts={effectiveLayouts}
          editMode={dashboardEditMode}
          autoAlign={dashboardAutoAlign}
          gridVisible={dashboardGridVisible}
          preview={dashboardPreview}
          onReorder={ids => reorderWorkspace('dashboard', ids)}
          onToggleLock={id => {
            const cur = effectiveLayouts.find(w => w.id === id);
            if (cur) updateWidget('dashboard', id, { locked: !cur.locked });
          }}
          onRemove={id => updateWidget('dashboard', id, { visible: false })}
          onChangeSpan={(id, span) => updateWidget('dashboard', id, { colSpan: span })}
          onChangeRowSpan={(id, span) => updateWidget('dashboard', id, { rowSpan: span as any })}
          onChangeCustomHeight={(id, px) => updateWidget('dashboard', id, { customHeight: px })}
          onChangeCustomWidth={(id, px) => updateWidget('dashboard', id, { customWidth: px })}
          onExpand={id => setExpandedId(id)}
          renderWidget={renderWidget}
        />
      )}

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

export default Dashboard;
