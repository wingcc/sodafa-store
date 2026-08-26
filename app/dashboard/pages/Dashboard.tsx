// SODFA MARKETPLACE - Dashboard Overview Page
// Store Performance Only: Orders, Revenue, Customers, Products, Inventory

'use client';

import React, { useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  PackageCheck,
  Clock,
  Plus,
  Tag,
  FileText,
  FolderPlus,
  UserCheck,
  Loader2,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import RevenueOverviewChart from '../components/charts/RevenueOverviewChart';
import SalesByCategoryChart from '../components/charts/SalesByCategoryChart';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';

const Dashboard: React.FC = () => {
  const {
    setCurrentPage,
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

  // Compute stats from live data
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  // Revenue breakdown
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'pending');
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPendingRevenue = pendingPayments.reduce((sum, o) => sum + o.total, 0);
  const refundedOrders = orders.filter((o) => o.orderStatus === 'refunded');
  const totalRefunded = refundedOrders.reduce((sum, o) => sum + o.total, 0);

  // Top products by units sold (max 5)
  const topProducts = [...products]
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold)
    .slice(0, 5);

  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const pendingActionOrders = orders
    .filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'confirmed')
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#1E7A57] mx-auto mb-4" />
          <p className="text-gray-500">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: t('dashboard.quick.addProduct'), icon: <Plus size={16} />, page: 'products' as const, color: 'from-purple-500 to-purple-600' },
    { label: t('dashboard.quick.createCoupon'), icon: <Tag size={16} />, page: 'coupons' as const, color: 'from-pink-500 to-pink-600' },
    { label: t('dashboard.quick.viewOrders'), icon: <FileText size={16} />, page: 'orders' as const, color: 'from-blue-500 to-blue-600' },
    { label: t('dashboard.quick.addCategory'), icon: <FolderPlus size={16} />, page: 'categories' as const, color: 'from-amber-500 to-amber-600' },
    { label: t('dashboard.quick.customers'), icon: <UserCheck size={16} />, page: 'customers' as const, color: 'from-emerald-500 to-emerald-600' },
    { label: t('dashboard.quick.inventory'), icon: <PackageCheck size={16} />, page: 'inventory' as const, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.welcome')}
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefreshAll}
          isLoading={isLoading}
          size="md"
          variant="default"
        />
      </div>

      {/* ─── REVENUE & PAYMENTS STATS ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`${totalRevenue.toLocaleString()} MAD`}
          change={0}
          changeLabel="All time"
          icon={<DollarSign size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Paid Revenue"
          value={`${totalPaidRevenue.toLocaleString()} MAD`}
          change={0}
          changeLabel="Completed payments"
          icon={<DollarSign size={22} />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Pending Payments"
          value={`${totalPendingRevenue.toLocaleString()} MAD`}
          change={0}
          changeLabel={`${pendingPayments.length} orders`}
          icon={<Clock size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Refunded Amount"
          value={`${totalRefunded.toLocaleString()} MAD`}
          change={0}
          changeLabel={`${refundedOrders.length} orders`}
          icon={<DollarSign size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* ─── CUSTOMER & PRODUCT STATS ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalCustomers')}
          value={totalCustomers.toLocaleString()}
          change={0}
          changeLabel={t('dashboard.fromLiveData')}
          icon={<Users size={22} />}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <StatCard
          title={t('dashboard.totalProducts')}
          value={totalProducts.toLocaleString()}
          change={0}
          changeLabel={`${outOfStockProducts.length} out of stock`}
          icon={<Package size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Low Stock"
          value={lowStockProducts.length.toLocaleString()}
          change={0}
          changeLabel="Products need restocking"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockProducts.length.toLocaleString()}
          change={0}
          changeLabel="Products unavailable"
          icon={<PackageCheck size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.quickActions')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setCurrentPage(action.page)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-purple-200 hover:bg-purple-50/30 dark:hover:bg-white/5 transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row: Revenue + Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueOverviewChart />
        </div>
        <SalesByCategoryChart />
      </div>

      {/* Orders & Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.recentOrders')}</h3>
            <button
              onClick={() => setCurrentPage('orders')}
              className="text-sm text-[#1E7A57] font-medium hover:text-[#165c44] flex items-center gap-1"
            >
              {t('dashboard.viewAll')} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.total} MAD</p>
                  <Badge
                    variant={
                      order.orderStatus === 'delivered' ? 'success' :
                      order.orderStatus === 'shipped' ? 'info' :
                      order.orderStatus === 'processing' ? 'purple' :
                      order.orderStatus === 'confirmed' ? 'warning' :
                      order.orderStatus === 'cancelled' ? 'danger' : 'default'
                    }
                    size="sm"
                    dot
                  >
                    {order.orderStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.topProducts')}</h3>
            <button
              onClick={() => setCurrentPage('products')}
              className="text-sm text-[#1E7A57] font-medium hover:text-[#165c44] flex items-center gap-1"
            >
              {t('dashboard.viewAll')} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-5 text-center">#{index + 1}</span>
                  <img
                    src={product.images?.[0] ?? ''}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.categoryName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.totalSold.toLocaleString()} sold</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock & Pending Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.lowStockAlerts')}</h3>
            </div>
            <button
              onClick={() => setCurrentPage('inventory')}
              className="text-sm text-[#1E7A57] font-medium hover:text-[#165c44] flex items-center gap-1"
            >
              {t('dashboard.manage')} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{t('dashboard.onlyLeft', { count: String(product.stock) })}</p>
                  </div>
                </div>
                <Badge variant="warning" size="sm" dot>{t('dashboard.lowStock')}</Badge>
              </div>
            ))}
            {outOfStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{t('dashboard.outOfStock')}</p>
                  </div>
                </div>
                <Badge variant="danger" size="sm" dot>{t('dashboard.outOfStockBadge')}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.pendingActions')}</h3>
            </div>
            <button
              onClick={() => setCurrentPage('orders')}
              className="text-sm text-[#1E7A57] font-medium hover:text-[#165c44] flex items-center gap-1"
            >
              {t('dashboard.viewAll')} <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {pendingActionOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.total} MAD</p>
                  <Badge variant={order.orderStatus === 'pending' ? 'warning' : 'info'} size="sm">
                    {order.orderStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
