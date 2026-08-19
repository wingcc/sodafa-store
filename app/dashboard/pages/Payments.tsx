// SODFA MARKETPLACE - Payments Management Page

import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { orders } from '../data/mockData';

const Payments: React.FC = () => {
  const handleRefresh = () => {
    // Refresh payment data
  };
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'pending');
  const failedPayments = orders.filter((o) => o.paymentStatus === 'failed');

  const totalPaid = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPending = pendingPayments.reduce((sum, o) => sum + o.total, 0);

  const paymentMethodCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const method = o.paymentMethod.replace('_', ' ');
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage all payment transactions</p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          size="md"
          variant="default"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Paid" value={`${totalPaid.toLocaleString()} MAD`} icon={<CheckCircle2 size={22} />} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pending" value={`${totalPending.toLocaleString()} MAD`} icon={<Clock size={22} />} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Failed" value={`${failedPayments.length}`} icon={<XCircle size={22} />} iconBg="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Refunded" value="0 MAD" icon={<RotateCcw size={22} />} iconBg="bg-gray-50" iconColor="text-gray-600" />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(paymentMethodCounts).map(([method, count]) => (
            <div key={method} className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <CreditCard size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">{method}</p>
                <p className="text-xs text-gray-500">{count} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600">{order.customerName}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600 capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-900">{order.total} MAD</span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'danger' : 'warning'}
                      size="sm"
                      dot
                    >
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
