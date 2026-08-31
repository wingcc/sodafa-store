'use client';

import React from 'react';
import { Clock, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import DashboardInfoButton from './DashboardInfoButton';
import type { Order } from '../../types';
import { WidgetIcon } from './workspace/icons';

const PendingActionsCard: React.FC<{ orders: Order[]; isExpanded?: boolean }> = ({ orders, isExpanded = false }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  const pending = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').slice(0, 5);
  if (isExpanded) {
    const pendingAll = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed');
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center"><WidgetIcon id="pending-actions" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'إجراءات معلقة — تفصيلي' : 'Pending Actions — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pendingAll.length} {isAr ? 'طلب يحتاج إجراء' : 'orders need action'} • {pendingAll.reduce((s, o) => s + o.total, 0).toLocaleString()} MAD</p>
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
                {pendingAll.slice(0, 15).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0"><FileText size={14} className="text-blue-600 dark:text-blue-400" /></div>
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">{order.total} MAD</td>
                    <td className="py-3 px-4"><Badge variant={order.orderStatus === 'pending' ? 'warning' : 'info'} size="sm">{order.orderStatus}</Badge></td>
                    <td className="py-3 px-4 text-gray-500 dark:text-white/40 hidden sm:table-cell text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
                {!pendingAll.length && <tr><td colSpan={5} className="py-12 text-center text-gray-400">{isAr ? 'لا توجد إجراءات معلقة' : 'No pending actions'}</td></tr>}
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
          <WidgetIcon id="pending-actions" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.pendingActions')}</h3>
          <DashboardInfoButton title={isAr ? 'إجراءات معلقة' : 'Pending Actions'} description={isAr ? 'طلبات تحتاج إلى تأكيد أو معالجة. التأخير يزيد الإلغاء.' : 'Orders needing confirmation/processing. Delays increase cancellations.'} />
        </div>
        <button onClick={() => setCurrentPage('orders')} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-darkGreen, #047857)' }}>
          {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain space-y-2 pr-1">
        {pending.map(order => (
          <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/15">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.orderNumber}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customerName}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.total} MAD</p>
              <Badge variant={order.orderStatus === 'pending' ? 'warning' : 'info'} size="sm">{order.orderStatus}</Badge>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-sm text-gray-400 dark:text-white/40 text-center py-6">{isAr ? 'لا توجد إجراءات معلقة' : 'No pending actions'}</p>}
      </div>
    </div>
  );
};

export default PendingActionsCard;
