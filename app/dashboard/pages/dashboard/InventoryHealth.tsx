'use client';

import React from 'react';
import { Boxes, TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getInventoryHealth } from './utils';
import type { Product } from '../../types';
import { WidgetIcon } from './workspace/icons';

const InventoryHealth: React.FC<{ products: Product[]; onExpand?: () => void; isExpanded?: boolean }> = ({ products, onExpand, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const h = getInventoryHealth(products);

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/10 flex items-center justify-center"><WidgetIcon id="inventory-health" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'صحة المخزون — تفصيلي' : 'Inventory Health — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{h.total} {isAr ? 'منتج' : 'SKUs'} • {h.totalStockValue.toLocaleString()} MAD {isAr ? 'قيمة' : 'value'}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10 border border-teal-100 dark:border-teal-500/15 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{isAr ? 'إجمالي قيمة المخزون' : 'Total Stock Value'}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{h.totalStockValue.toLocaleString()} MAD</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{isAr ? 'صحة المخزون' : 'Health Score'}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: h.healthPct > 70 ? '#059669' : h.healthPct > 40 ? '#d97706' : '#dc2626' }}>{h.healthPct}%</p>
            </div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-white dark:bg-white/10 overflow-hidden border border-teal-100 dark:border-white/5"><div className="h-full rounded-full" style={{ width: `${h.healthPct}%`, background: h.healthPct > 70 ? '#10b981' : h.healthPct > 40 ? '#f59e0b' : '#ef4444' }} /></div>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-2 text-center">{h.healthPct > 70 ? (isAr ? 'مخزون صحي' : 'Healthy stock') : h.healthPct > 40 ? (isAr ? 'يحتاج انتباه' : 'Needs attention') : (isAr ? 'حرج — تحرك سريعاً' : 'Critical — act now')}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/15 p-5 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{isAr ? 'غير متوفر' : 'Out of Stock'}</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{h.outOfStock}</p>
            <p className="text-xs text-red-600/70 dark:text-red-300/60 mt-1">{h.total ? Math.round((h.outOfStock / h.total) * 100) : 0}%</p>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-5 text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{isAr ? 'منخفض' : 'Low Stock'}</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{h.lowStock}</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-300/60 mt-1">{isAr ? 'تحتاج إعادة تموين' : 'Needs restock'}</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{isAr ? 'إجمالي المنتجات' : 'Total SKUs'}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{h.total}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{h.total - h.outOfStock - h.lowStock} {isAr ? 'بحالة جيدة' : 'healthy'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/15 p-5">
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2"><TrendingUp size={16} />{isAr ? 'الأسرع مبيعاً' : 'Fast-moving'} • {h.fastMoving.length}</h4>
            <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {h.fastMoving.length ? h.fastMoving.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.06] border border-emerald-100 dark:border-white/5">
                  <img src={p.images?.[0] || ''} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-white/10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{p.stock} {isAr ? 'متبقي' : 'left'}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 shrink-0">{p.totalSold} {isAr ? 'مباع' : 'sold'}</span>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-8">{isAr ? 'لا توجد بيانات' : 'No data'}</p>}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><TrendingDown size={16} />{isAr ? 'بطيء الحركة' : 'Slow-moving'}</h4>
            <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {h.slowMoving.length ? h.slowMoving.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <img src={p.images?.[0] || ''} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-white/10 shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{p.totalSold} {isAr ? 'مباع' : 'sold'} • {p.stock} {isAr ? 'متبقي' : 'left'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">{isAr ? 'راجع' : 'Review'}</span>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-8">{isAr ? 'لا توجد بيانات' : 'No data'}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <WidgetIcon id="inventory-health" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'صحة المخزون' : 'Inventory Health'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'القيمة والحركة' : 'Value & movement'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DashboardInfoButton
            title={isAr ? 'صحة المخزون' : 'Inventory Health'}
            description={isAr ? 'يساعد على معرفة المنتجات التي تحتاج إعادة تموين والبطيئة الحركة لتجنب ضياع المبيعات وتكدس المخزون.' : 'Spot products needing restock vs slow movers to prevent lost sales and overstock.'}
          />
          {onExpand && (
            <button onClick={onExpand} title={isAr ? 'توسيع' : 'Expand'} className="w-7 h-7 rounded-full flex items-center justify-center border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:text-[var(--color-darkGreen)]">
              <Maximize2 size={14} />
            </button>
          )}
        </div>
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
