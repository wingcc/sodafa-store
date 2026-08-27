'use client';

import React from 'react';
import { Boxes, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getInventoryHealth } from './utils';
import type { Product } from '../../types';

const InventoryHealth: React.FC<{ products: Product[] }> = ({ products }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const h = getInventoryHealth(products);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            <Boxes size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'صحة المخزون' : 'Inventory Health'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'القيمة والحركة' : 'Value & movement'}</p>
          </div>
        </div>
        <DashboardInfoButton
          title={isAr ? 'صحة المخزون' : 'Inventory Health'}
          description={isAr ? 'يساعد على معرفة المنتجات التي تحتاج إعادة تموين والبطيئة الحركة لتجنب ضياع المبيعات وتكدس المخزون.' : 'Spot products needing restock vs slow movers to prevent lost sales and overstock.'}
        />
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'إجمالي قيمة المخزون' : 'Total Stock Value'}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{h.totalStockValue.toLocaleString()} MAD</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'صحة المخزون' : 'Health'}</p>
          <p className="text-sm font-bold" style={{ color: h.healthPct > 70 ? '#059669' : h.healthPct > 40 ? '#d97706' : '#dc2626' }}>{h.healthPct}%</p>
        </div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${h.healthPct}%`, background: h.healthPct > 70 ? '#10b981' : h.healthPct > 40 ? '#f59e0b' : '#ef4444' }} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2.5">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{isAr ? 'غير متوفر' : 'Out of Stock'}</p>
          <p className="text-base font-bold text-red-600 dark:text-red-400">{h.outOfStock}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2.5">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{isAr ? 'منخفض' : 'Low Stock'}</p>
          <p className="text-base font-bold text-amber-600 dark:text-amber-400">{h.lowStock}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2.5">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{isAr ? 'إجمالي المنتجات' : 'Total SKUs'}</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">{h.total}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/15 bg-emerald-50/50 dark:bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1"><TrendingUp size={12} /> {isAr ? 'الأسرع مبيعاً' : 'Fast-moving'}</p>
          <ul className="mt-2 space-y-1.5">
            {h.fastMoving.length ? h.fastMoving.map(p => (
              <li key={p.id} className="flex items-center justify-between text-xs">
                <span className="truncate text-gray-700 dark:text-gray-300 pr-2">{p.name}</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-300 shrink-0">{p.totalSold} sold</span>
              </li>
            )) : <li className="text-xs text-gray-400">—</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"><TrendingDown size={12} /> {isAr ? 'بطيء الحركة' : 'Slow-moving'}</p>
          <ul className="mt-2 space-y-1.5">
            {h.slowMoving.length ? h.slowMoving.map(p => (
              <li key={p.id} className="flex items-center justify-between text-xs">
                <span className="truncate text-gray-600 dark:text-gray-400 pr-2">{p.name}</span>
                <span className="text-gray-500 dark:text-gray-400 shrink-0">{p.totalSold} sold • {p.stock} left</span>
              </li>
            )) : <li className="text-xs text-gray-400">—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InventoryHealth;
