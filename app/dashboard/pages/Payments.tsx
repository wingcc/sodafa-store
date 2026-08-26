// SODFA MARKETPLACE - Payments Management Page

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  TrendingUp,
  Search,
  Loader2,
  RefreshCw,
  Banknote,
  Smartphone,
  Building2,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { useTranslation } from '../i18n/useTranslation';
import { useStore } from '../store/useStore';

interface PaymentData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_method: string | null;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
}

interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  totalRefunded: number;
  countPaid: number;
  countPending: number;
  countFailed: number;
  countRefunded: number;
  methodCounts: Record<string, number>;
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  cash_on_delivery: <Banknote size={18} />,
  credit_card: <CreditCard size={18} />,
  bank_transfer: <Building2 size={18} />,
  mobile_payment: <Smartphone size={18} />,
};

const Payments: React.FC = () => {
  const { t } = useTranslation();
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const setPendingNavigation = useStore((s) => s.setPendingNavigation);

  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Check for pending navigation (from notification View Details)
  const pendingNavigation = useStore((s) => s.pendingNavigation);
  const clearPendingNavigation = useStore((s) => s.clearPendingNavigation);

  useEffect(() => {
    if (pendingNavigation?.page === 'payments') {
      if (pendingNavigation.searchQuery) {
        setSearchQuery(pendingNavigation.searchQuery);
      }
      clearPendingNavigation();
    }
  }, [pendingNavigation, clearPendingNavigation]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (methodFilter !== 'all') params.set('method', methodFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');

      const res = await fetch(`/api/payments?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data.payments);
        setStats(json.data.stats);
        setTotal(json.data.total);
      }
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter, searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefresh = () => fetchPayments();

  const formatMethod = (method: string) =>
    method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'confirmed': return 'default';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('payments.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage all payment transactions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paid"
          value={`${(stats?.totalPaid ?? 0).toLocaleString()} MAD`}
          icon={<CheckCircle2 size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Pending"
          value={`${(stats?.totalPending ?? 0).toLocaleString()} MAD`}
          icon={<Clock size={22} />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Failed"
          value={`${stats?.countFailed ?? 0}`}
          icon={<XCircle size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Refunded"
          value={`${(stats?.totalRefunded ?? 0).toLocaleString()} MAD`}
          icon={<RotateCcw size={22} />}
          iconBg="bg-gray-50"
          iconColor="text-gray-600"
        />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats?.methodCounts ?? {}).map(([method, count]) => (
            <button
              key={method}
              onClick={() => setMethodFilter(methodFilter === method ? 'all' : method.replace(/ /g, '_'))}
              className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                methodFilter === method.replace(/ /g, '_')
                  ? 'bg-[var(--color-darkGreen)]/10 ring-2 ring-[var(--color-darkGreen)]/30'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                methodFilter === method.replace(/ /g, '_')
                  ? 'bg-[var(--color-darkGreen)] text-white'
                  : 'bg-[var(--color-darkGreen)]/10 text-[var(--color-darkGreen)]'
              }`}>
                {METHOD_ICONS[method.replace(/ /g, '_')] ?? <CreditCard size={18} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 capitalize">{method}</p>
                <p className="text-xs text-gray-500">{count} orders</p>
              </div>
            </button>
          ))}
          {Object.keys(stats?.methodCounts ?? {}).length === 0 && !loading && (
            <p className="text-sm text-gray-400 col-span-4">No payment data yet</p>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, customer, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 focus:border-[var(--color-darkGreen)]/50 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Transactions</h3>
          <span className="text-xs text-gray-500">{total} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-darkGreen)]" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No payments found</p>
            <p className="text-xs text-gray-400 mt-1">Payments will appear here once orders are placed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-[var(--color-darkGreen)]">{payment.order_number}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.customer_name}</p>
                        <p className="text-xs text-gray-400">{payment.customer_email || payment.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-darkGreen)]">
                          {METHOD_ICONS[payment.payment_method] ?? <CreditCard size={16} />}
                        </span>
                        <span className="text-sm text-gray-600 capitalize">{formatMethod(payment.payment_method)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-gray-900">{Number(payment.total).toLocaleString()} MAD</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={getStatusColor(payment.payment_status) as any} size="sm" dot>
                        {payment.payment_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={getOrderStatusColor(payment.order_status) as any} size="sm">
                        {payment.order_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => {
                          setPendingNavigation({ page: 'orders', itemId: payment.id, searchQuery: payment.order_number });
                          setCurrentPage('orders');
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-darkGreen)]/10 text-gray-400 hover:text-[var(--color-darkGreen)] transition-colors"
                        title="View Order"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
