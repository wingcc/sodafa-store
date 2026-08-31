'use client';

import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import DashboardInfoButton from './DashboardInfoButton';
import type { Order } from '../../types';
import { WidgetIcon } from './workspace/icons';

const RecentOrdersCard: React.FC<{ orders: Order[]; isExpanded?: boolean }> = ({ orders, isExpanded = false }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  if (isExpanded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><WidgetIcon id="recent-orders" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'الطلبات الأخيرة — تفصيلي' : 'Recent Orders — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} {isAr ? 'طلب' : 'orders'} • {isAr ? 'آخر 15 طلب' : 'latest 15 orders'}</p>
          </div>
          <button onClick={() => setCurrentPage('orders')} className="ml-auto text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-darkGreen)] text-white hover:opacity-90">
            {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
          </button>
        </div>
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 dark:text-white/40 text-left border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5"><th className="py-3 px-4 font-medium">{isAr ? 'الطلب' : 'Order'}</th><th className="py-3 px-4 font-medium">{isAr ? 'العميل' : 'Customer'}</th><th className="py-3 px-4 font-medium text-right">{isAr ? 'المبلغ' : 'Total'}</th><th className="py-3 px-4 font-medium">{isAr ? 'الحالة' : 'Status'}</th><th className="py-3 px-4 font-medium hidden sm:table-cell">{isAr ? 'التاريخ' : 'Date'}</th></tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {orders.slice(0, 15).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{order.customerName}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">{order.total} MAD</td>
                    <td className="py-3 px-4"><Badge variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'shipped' ? 'info' : order.orderStatus === 'processing' ? 'purple' : order.orderStatus === 'confirmed' ? 'warning' : order.orderStatus === 'cancelled' ? 'danger' : 'default'} size="sm" dot>{order.orderStatus}</Badge></td>
                    <td className="py-3 px-4 text-gray-500 dark:text-white/40 hidden sm:table-cell text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
                {!orders.length && <tr><td colSpan={5} className="py-12 text-center text-gray-400">{t('common.noData')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="recent-orders" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.recentOrders')}</h3>
          <DashboardInfoButton
            title={isAr ? 'الطلبات الأخيرة' : 'Recent Orders'}
            description={isAr ? 'آخر 5 طلبات. يساعدك على متابعة النشاط الحالي بسرعة.' : 'Latest 5 orders. Track current activity at a glance.'}
          />
        </div>
        <button onClick={() => setCurrentPage('orders')} className="text-sm font-medium flex items-center gap-1 shrink-0" style={{ color: 'var(--color-darkGreen, #047857)' }}>
          {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors border border-transparent dark:border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                <ShoppingCart size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.orderNumber}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customerName}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.total} MAD</p>
              <Badge variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'shipped' ? 'info' : order.orderStatus === 'processing' ? 'purple' : order.orderStatus === 'confirmed' ? 'warning' : order.orderStatus === 'cancelled' ? 'danger' : 'default'} size="sm" dot>
                {order.orderStatus}
              </Badge>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-gray-400 dark:text-white/40 text-center py-8">{t('common.noData')}</p>}
      </div>
    </div>
  );
};

export default RecentOrdersCard;
