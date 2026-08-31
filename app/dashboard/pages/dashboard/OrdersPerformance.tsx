'use client';

import React, { useMemo } from 'react';
import { ShoppingCart, CheckCircle2, Clock3, XCircle, RotateCcw, TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getOrderStatusCounts, sparklinePath, buildOrdersSparkline } from './utils';
import type { Order } from '../../types';
import { WidgetIcon } from './workspace/icons';

const OrdersPerformance: React.FC<{ orders: Order[]; onExpand?: () => void; isExpanded?: boolean }> = ({ orders, onExpand, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const counts = getOrderStatusCounts(orders);
  const total = orders.length;
  const completed = counts.delivered;
  const pending = counts.pending + counts.confirmed;
  const cancelled = counts.cancelled;
  const returned = counts.refunded;

  const spark = buildOrdersSparkline(orders, 7);
  const growth = useMemo(() => {
    if (spark.length < 2) return 0;
    const prev = spark.slice(0, 3).reduce((a, b) => a + b, 0);
    const curr = spark.slice(-3).reduce((a, b) => a + b, 0);
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [spark]);

  const items = [
    { label: isAr ? 'مكتمل' : 'Completed', value: completed, icon: <CheckCircle2 size={14} className="text-emerald-600" />, color: 'bg-emerald-500' },
    { label: isAr ? 'قيد الانتظار' : 'Pending', value: pending, icon: <Clock3 size={14} className="text-amber-600" />, color: 'bg-amber-500' },
    { label: isAr ? 'ملغي' : 'Cancelled', value: cancelled, icon: <XCircle size={14} className="text-red-600" />, color: 'bg-red-500' },
    { label: isAr ? 'مرتجع' : 'Returned', value: returned, icon: <RotateCcw size={14} className="text-orange-600" />, color: 'bg-orange-500' },
  ];

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><WidgetIcon id="orders-performance" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء الطلبات — تفصيلي' : 'Orders Performance — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} {isAr ? 'طلب' : 'orders'} • {completed} {isAr ? 'مكتمل' : 'completed'}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'الإجمالي' : 'Total Orders'}</p>
              <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">{total.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                {growth >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                <span className={growth >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{growth >= 0 ? '+' : ''}{growth}%</span>
                <span>{isAr ? 'مقابل 7 أيام' : 'vs last 7d'}</span>
              </p>
            </div>
            <div className="w-[160px] h-[48px]">
              <svg viewBox="0 0 100 28" className="w-full h-full">
                <path d={sparklinePath(spark, 100, 28)} fill="none" stroke="var(--color-darkGreen, #047857)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(it => (
            <div key={it.label} className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center mx-auto">{it.icon}</div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-3">{it.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{it.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{total ? Math.round((it.value / total) * 100) : 0}% {isAr ? 'من الإجمالي' : 'of total'}</p>
              <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className={`h-full ${it.color}`} style={{ width: `${total ? Math.round((it.value / total) * 100) : 0}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'التوزيع' : 'Distribution'}</h4>
          <div className="flex gap-1.5 h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 p-1">
            {items.map(it => (
              <div key={it.label} className={`${it.color} rounded-full`} style={{ width: `${total ? (it.value / total) * 100 : 0}%` }} title={`${it.label}: ${it.value}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {items.map(it => (
              <div key={it.label} className="flex items-center gap-2 text-sm">
                <span className={`w-3 h-3 rounded-full ${it.color} shrink-0`} />
                <span className="text-gray-700 dark:text-gray-300">{it.label}</span>
                <span className="ml-auto font-bold text-gray-900 dark:text-white">{it.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="orders-performance" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء الطلبات' : 'Orders Performance'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'حجم وحالة الطلبات' : 'Volume & status health'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DashboardInfoButton
            title={isAr ? 'أداء الطلبات' : 'Orders Performance'}
            description={isAr ? 'يوضح عدد الطلبات وتوزيع حالاتها عبر الزمن. مقارنة المكتمل بالملغي والمرتجع تكشف جودة المبيعات.' : 'Shows order volume and status mix over time. Comparing completed vs cancelled/returned reveals sales quality.'}
          />
          {onExpand && (
            <button onClick={onExpand} title={isAr ? 'توسيع' : 'Expand'} className="w-7 h-7 rounded-full flex items-center justify-center border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:text-[var(--color-darkGreen)] hover:border-[var(--color-darkGreen)]/20">
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto overscroll-contain pr-1 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              {growth >= 0 ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
              <span className={growth >= 0 ? 'text-emerald-600' : 'text-red-600'}>{growth >= 0 ? '+' : ''}{growth}%</span>
              <span>{isAr ? 'مقابل 7 أيام' : 'vs last 7d'}</span>
            </p>
          </div>
          <div className="w-[112px] h-[36px]">
            <svg viewBox="0 0 100 28" className="w-full h-full">
              <path d={sparklinePath(spark, 100, 28)} fill="none" stroke="var(--color-darkGreen, #047857)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {items.map(it => (
            <div key={it.label} className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                {it.icon} <span className="hidden sm:inline">{it.label}</span><span className="sm:hidden">{it.label.slice(0,3)}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{it.value}</p>
              <div className="mt-1.5 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div className={`h-full ${it.color}`} style={{ width: `${total ? Math.round((it.value / total) * 100) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10">
          {items.map(it => (
            <div key={it.label} className={it.color} style={{ width: `${total ? (it.value / total) * 100 : 0}%` }} title={`${it.label}: ${it.value}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPerformance;
