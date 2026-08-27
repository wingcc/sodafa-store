'use client';

import React from 'react';
import { Clock, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import DashboardInfoButton from './DashboardInfoButton';
import type { Order } from '../../types';

const PendingActionsCard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  const pending = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').slice(0, 5);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-blue-500" />
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
