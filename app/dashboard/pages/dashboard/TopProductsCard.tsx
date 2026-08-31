'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import DashboardInfoButton from './DashboardInfoButton';
import type { Product } from '../../types';
import { WidgetIcon } from './workspace/icons';

const TopProductsCard: React.FC<{ products: Product[]; isExpanded?: boolean }> = ({ products, isExpanded = false }) => {
  const { t, language } = useTranslation();
  const { setCurrentPage } = useStore();
  const isAr = language === 'ar';
  const top = [...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
  const maxSold = Math.max(...top.map(p => p.totalSold), 1);
  if (isExpanded) {
    const topExpanded = [...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 15);
    const maxSoldExp = Math.max(...topExpanded.map(p => p.totalSold), 1);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center"><WidgetIcon id="top-products" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'أفضل المنتجات — تفصيلي' : 'Top Products — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{topExpanded.length} {isAr ? 'منتج' : 'products'} • {isAr ? 'الأكثر مبيعاً' : 'best sellers'}</p>
          </div>
          <button onClick={() => setCurrentPage('products')} className="ml-auto text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-darkGreen)] text-white hover:opacity-90">
            {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
          </button>
        </div>
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 dark:text-white/40 text-left border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5"><th className="py-3 px-4 font-medium">#</th><th className="py-3 px-4 font-medium">{isAr ? 'المنتج' : 'Product'}</th><th className="py-3 px-4 font-medium text-right">{isAr ? 'مباع' : 'Sold'}</th><th className="py-3 px-4 font-medium text-right hidden sm:table-cell">{isAr ? 'المخزون' : 'Stock'}</th><th className="py-3 px-4 font-medium hidden md:table-cell">{isAr ? 'الأداء' : 'Share'}</th></tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {topExpanded.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-gray-400 dark:text-white/30">#{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] ?? ''} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-white/10 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-white/40 truncate">{p.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">{p.totalSold.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300 hidden sm:table-cell">{p.stock}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden max-w-[100px]"><div className="h-full rounded-full" style={{ width: `${(p.totalSold / maxSoldExp) * 100}%`, background: 'var(--color-darkGreen, #047857)' }} /></div>
                        <span className="text-xs text-gray-500 dark:text-white/40 w-8 text-right">{Math.round((p.totalSold / maxSoldExp) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
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
          <WidgetIcon id="top-products" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('dashboard.topProducts')}</h3>
          <DashboardInfoButton title={isAr ? 'أفضل المنتجات' : 'Top Products'} description={isAr ? 'المنتجات الأكثر مبيعاً حسب الوحدات. ركز عليها في التسويق وإعادة التموين.' : 'Best sellers by units sold. Prioritize them for marketing & restock.'} />
        </div>
        <button onClick={() => setCurrentPage('products')} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-darkGreen, #047857)' }}>
          {t('dashboard.viewAll')} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain space-y-3 pr-1">
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
