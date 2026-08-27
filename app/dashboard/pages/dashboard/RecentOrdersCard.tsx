'use client';

import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import DashboardInfoButton from './DashboardInfoButton';
import type { Order } from '../../types';

const RecentOrdersCard: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.recentOrders')}</h3>
          <DashboardInfoButton
            title={isAr ? 'الطلبات الأخيرة' : 'Recent Orders'}
            description={isAr ? 'آخر 5 طلبات. يساعدك على متابعة النشاط الحالي بسرعة.' : 'Latest 5 orders. Track current activity at a glance.'}
          />
        </div>
        <button onClick={() => setCurrentPage('orders')} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-darkGreen, #047857)' }}>
          {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="space-y-3">
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
