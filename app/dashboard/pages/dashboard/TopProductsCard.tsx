'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import DashboardInfoButton from './DashboardInfoButton';
import type { Product } from '../../types';

const TopProductsCard: React.FC<{ products: Product[] }> = ({ products }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  const top = [...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
  const maxSold = Math.max(...top.map(p => p.totalSold), 1);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.topProducts')}</h3>
          <DashboardInfoButton title={isAr ? 'أفضل المنتجات' : 'Top Products'} description={isAr ? 'المنتجات الأكثر مبيعاً حسب الوحدات. ركز عليها في التسويق وإعادة التموين.' : 'Best sellers by units sold. Prioritize them for marketing & restock.'} />
        </div>
        <button onClick={() => setCurrentPage('products')} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-darkGreen, #047857)' }}>
          {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="space-y-3">
        {top.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors border border-transparent dark:border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-gray-300 dark:text-white/20 w-5 text-center">#{index + 1}</span>
              <img src={product.images?.[0] ?? ''} alt={product.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-white/10" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.categoryName}</p>
              </div>
            </div>
            <div className="text-right shrink-0 min-w-[84px]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.totalSold.toLocaleString()} sold</p>
              <div className="mt-1 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(product.totalSold / maxSold) * 100}%`, background: 'var(--color-darkGreen, #047857)' }} />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{product.stock} in stock</p>
            </div>
          </div>
        ))}
        {top.length === 0 && <p className="text-sm text-gray-400 dark:text-white/40 text-center py-8">{t('common.noData')}</p>}
      </div>
    </div>
  );
};

export default TopProductsCard;
