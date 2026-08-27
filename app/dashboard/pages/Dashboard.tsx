// SODFA MARKETPLACE - Dashboard Overview (Customizable Workspace)
'use client';

import React, { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
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
import WorkspaceGrid from './dashboard/workspace/WorkspaceGrid';
import WorkspaceToolbar from './dashboard/workspace/WorkspaceToolbar';
import { dashboardRegistry, dashboardDefaults } from './dashboard/workspace/registry';

const Dashboard: React.FC = () => {
  const { products, orders, customers, isLoadingProducts, isLoadingOrders, isLoadingCustomers, fetchProducts, fetchOrders, fetchCustomers } = useStore();
  const { t } = useTranslation();
  const { dashboard: layouts, dashboardEditMode, setDashboard, toggleDashboardEdit, updateWidget, reorderWorkspace, resetWorkspace, hasHydrated } = useWorkspaceStore();

  const isLoading = isLoadingProducts || isLoadingOrders || isLoadingCustomers;

  const handleRefreshAll = async () => { await Promise.all([fetchProducts(), fetchOrders(), fetchCustomers()]); };

  useEffect(() => { fetchProducts(); fetchOrders(); fetchCustomers(); }, [fetchProducts, fetchOrders, fetchCustomers]);

  // Init defaults if empty after hydration
  useEffect(() => {
    if (hasHydrated && layouts.length === 0) {
      setDashboard(dashboardDefaults);
    }
  }, [hasHydrated, layouts.length, setDashboard]);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const paidRevenue = useMemo(() => orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0), [orders]);
  const pendingPayments = useMemo(() => orders.filter(o => o.paymentStatus === 'pending'), [orders]);
  const pendingRevenue = useMemo(() => pendingPayments.reduce((s, o) => s + o.total, 0), [pendingPayments]);
  const refunded = useMemo(() => orders.filter(o => o.orderStatus === 'refunded').reduce((s, o) => s + o.total, 0), [orders]);
  const refundedCount = useMemo(() => orders.filter(o => o.orderStatus === 'refunded').length, [orders]);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'kpi-grid':
        return <KpiGrid orders={orders} products={products} customers={customers} totalRevenue={totalRevenue} paidRevenue={paidRevenue} pendingRevenue={pendingRevenue} refunded={refunded} pendingCount={pendingPayments.length} refundedCount={refundedCount} />;
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
      default: return null;
    }
  };

  const skeletonFor = (id: string, span: number) => {
    const h = id === 'kpi-grid' ? 'h-[220px]' : id === 'revenue-overview' ? 'h-[360px]' : id === 'quick-actions' ? 'h-[180px]' : 'h-[300px]';
    return <div className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse ${h}`}><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mb-3" /><div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-48 mb-2" /><div className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl" /></div>;
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

  const effectiveLayouts = layouts.length ? layouts : dashboardDefaults;

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={handleRefreshAll} isLoading={isLoading} />
      <WorkspaceToolbar
        editMode={dashboardEditMode}
        onToggleEdit={toggleDashboardEdit}
        registry={dashboardRegistry}
        layouts={effectiveLayouts}
        onShow={(id) => updateWidget('dashboard', id, { visible: true })}
        onReset={() => resetWorkspace('dashboard', dashboardDefaults)}
      />

      {isLoading ? (
        <div className="grid grid-cols-12 gap-4">
          {effectiveLayouts.filter(l => l.visible).map(l => (
            <div key={l.id} className={`col-span-12 ${l.colSpan === 12 ? 'lg:col-span-12' : l.colSpan === 9 ? 'lg:col-span-9' : l.colSpan === 6 ? 'lg:col-span-6' : 'lg:col-span-3'} md:col-span-6`}>
              {skeletonFor(l.id, l.colSpan)}
            </div>
          ))}
        </div>
      ) : (
        <WorkspaceGrid
          registry={dashboardRegistry}
          layouts={effectiveLayouts}
          editMode={dashboardEditMode}
          onReorder={(ids) => reorderWorkspace('dashboard', ids)}
          onToggleLock={(id) => {
            const cur = effectiveLayouts.find(w => w.id === id);
            if (cur) updateWidget('dashboard', id, { locked: !cur.locked });
          }}
          onHide={(id) => updateWidget('dashboard', id, { visible: false })}
          onChangeSpan={(id, span) => updateWidget('dashboard', id, { colSpan: span })}
          renderWidget={renderWidget}
        />
      )}
    </div>
  );
};

export default Dashboard;
