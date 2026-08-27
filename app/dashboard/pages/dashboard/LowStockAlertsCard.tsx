'use client';

import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import DashboardInfoButton from './DashboardInfoButton';
import type { Product } from '../../types';
import { WidgetIcon } from './workspace/icons';

const LowStockAlertsCard: React.FC<{ products: Product[] }> = ({ products }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  const low = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).slice(0, 3);
  const out = products.filter(p => p.stock === 0).slice(0, 3);
  const list = [...low, ...out].slice(0, 5);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="low-stock" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.lowStockAlerts')}</h3>
          <DashboardInfoButton title={isAr ? 'تنبيهات المخزون' : 'Stock Alerts'} description={isAr ? 'منتجات على وشك النفاد أو نفدت. عالجها فوراً لتجنب خسارة المبيعات.' : 'Products low or out of stock. Act immediately to avoid lost sales.'} />
        </div>
        <button onClick={() => setCurrentPage('inventory')} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-darkGreen, #047857)' }}>
          {t('dashboard.manage')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain space-y-2 pr-1">
        {list.map(product => {
          const isOut = product.stock === 0;
          return (
            <div key={product.id} className={`flex items-center justify-between p-3 rounded-xl border ${isOut ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/15' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/15'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-white" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                  <p className={`text-xs ${isOut ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{isOut ? t('dashboard.outOfStock') : t('dashboard.onlyLeft', { count: String(product.stock) })}</p>
                </div>
              </div>
              <Badge variant={isOut ? 'danger' : 'warning'} size="sm" dot>{isOut ? t('dashboard.outOfStockBadge') : t('dashboard.lowStock')}</Badge>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm text-gray-400 dark:text-white/40 text-center py-6">{isAr ? 'المخزون في حالة جيدة' : 'Stock looks healthy'}</p>}
      </div>
    </div>
  );
};

export default LowStockAlertsCard;
