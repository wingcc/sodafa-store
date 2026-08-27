// SODFA MARKETPLACE - Dashboard Overview (Orchestrator)
// Store health: revenue, orders, COD, inventory, customers, actions
// Each section lives in ./dashboard/* with DashboardInfoButton for help.

'use client';

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
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

const Dashboard: React.FC = () => {
  const {
    products, orders, customers,
    isLoadingProducts, isLoadingOrders, isLoadingCustomers,
    fetchProducts, fetchOrders, fetchCustomers,
  } = useStore();
  const { t } = useTranslation();

  const isLoading = isLoadingProducts || isLoadingOrders || isLoadingCustomers;

  const handleRefreshAll = async () => {
    await Promise.all([fetchProducts(), fetchOrders(), fetchCustomers()]);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
  }, [fetchProducts, fetchOrders, fetchCustomers]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending');
  const pendingRevenue = pendingPayments.reduce((s, o) => s + o.total, 0);
  const refunded = orders.filter(o => o.orderStatus === 'refunded').reduce((s, o) => s + o.total, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: 'var(--color-darkGreen, #047857)' }} />
          <p className="text-gray-500 dark:text-gray-400">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={handleRefreshAll} isLoading={isLoading} />

      {/* Primary KPIs */}
      <KpiGrid
        orders={orders}
        products={products}
        customers={customers}
        totalRevenue={totalRevenue}
        paidRevenue={paidRevenue}
        pendingRevenue={pendingRevenue}
        refunded={refunded}
        pendingCount={pendingPayments.length}
        refundedCount={orders.filter(o => o.orderStatus === 'refunded').length}
      />

      {/* Revenue & Orders Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueOverview />
        </div>
        <div className="space-y-4">
          <OrdersPerformance orders={orders} />
          <AovCard orders={orders} />
        </div>
      </div>

      {/* Business Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CodPerformance orders={orders} />
        <InventoryHealth products={products} />
        <SalesByCategoryCard />
      </div>

      {/* Store Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrdersCard orders={orders} />
        <TopProductsCard products={products} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LowStockAlertsCard products={products} />
        <PendingActionsCard orders={orders} />
      </div>

      {/* Customer & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CustomerSnapshot customers={customers} />
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
