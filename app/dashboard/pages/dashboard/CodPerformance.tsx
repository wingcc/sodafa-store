'use client';

import React from 'react';
import { Truck, BadgeCheck, XCircle, Undo2, Wallet, Hourglass, Maximize2 } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getCodMetrics } from './utils';
import type { Order } from '../../types';
import { WidgetIcon } from './workspace/icons';

const Bar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-600 dark:text-gray-300">{label}</span>
      <span className="text-xs font-semibold text-gray-900 dark:text-white">{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  </div>
);

const CodPerformance: React.FC<{ orders: Order[]; onExpand?: () => void; isExpanded?: boolean }> = ({ orders, onExpand, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const m = getCodMetrics(orders);
  const hasData = orders.length > 0;

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center"><WidgetIcon id="cod-performance" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء الدفع عند الاستلام — تفصيلي' : 'COD Performance — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{m.codTotal} {isAr ? 'طلب دفع عند الاستلام' : 'COD orders'} • {m.cashCollected.toLocaleString()} MAD {isAr ? 'محصلة' : 'collected'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300"><BadgeCheck size={16} />{isAr ? 'معدل التأكيد' : 'Confirmation Rate'}</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{m.confirmationRate}%</p>
            <div className="mt-3 h-2.5 rounded-full bg-emerald-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.confirmationRate}%` }} /></div>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{isAr ? 'معلق → مؤكد' : 'Pending → Confirmed'}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"><Truck size={16} />{isAr ? 'نجاح التسليم' : 'Delivery Success'}</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{m.deliverySuccess}%</p>
            <div className="mt-3 h-2.5 rounded-full bg-sky-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{ width: `${m.deliverySuccess}%` }} /></div>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">{isAr ? 'تم التسليم / (الكل)' : 'Delivered / (Delivered+Cancelled+Returned)'}</p>
          </div>
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300"><XCircle size={16} />{isAr ? 'معدل الإلغاء' : 'Cancellation Rate'}</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{m.cancellationRate}%</p>
            <div className="mt-3 h-2.5 rounded-full bg-red-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${m.cancellationRate}%` }} /></div>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><Undo2 size={16} />{isAr ? 'الإرجاع / RTO' : 'Return / RTO'}</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{m.rtoRate}%</p>
            <div className="mt-3 h-2.5 rounded-full bg-amber-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${m.rtoRate}%` }} /></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-6 text-center">
            <Wallet size={20} className="mx-auto text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-2">{isAr ? 'تم تحصيله' : 'Cash Collected'}</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{m.cashCollected.toLocaleString()} MAD</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-300/60 mt-1">{m.codTotal ? Math.round((m.cashCollected / (m.cashCollected + m.cashPending || 1)) * 100) : 0}% {isAr ? 'من الإجمالي' : 'of total'}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-6 text-center">
            <Hourglass size={20} className="mx-auto text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">{isAr ? 'معلق' : 'Cash Pending'}</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">{m.cashPending.toLocaleString()} MAD</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-300/60 mt-1">{isAr ? 'بانتظار التسليم' : 'Awaiting delivery'}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 text-center">
            <BadgeCheck size={20} className="mx-auto text-gray-600 dark:text-gray-300" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2">{isAr ? 'إجمالي COD' : 'Total COD'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{m.codTotal}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{isAr ? 'طلب' : 'orders'}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'رؤى' : 'Insights'}</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2"><span className="text-emerald-500">•</span><span>{m.confirmationRate < 70 ? (isAr ? 'معدل التأكيد منخفض — حسّن التواصل لتأكيد الطلبات' : 'Low confirmation — improve call to confirm') : (isAr ? 'معدل تأكيد جيد' : 'Good confirmation rate')}</span></li>
            <li className="flex gap-2"><span className="text-sky-500">•</span><span>{m.deliverySuccess < 80 ? (isAr ? 'فشل التسليم مرتفع — راجع العناوين وشركات الشحن' : 'Delivery issues — check addresses & couriers') : (isAr ? 'تسليم ممتاز' : 'Excellent delivery')}</span></li>
            <li className="flex gap-2"><span className="text-amber-500">•</span><span>{m.rtoRate > 15 ? (isAr ? 'الإرجاع مرتفع — قد يشير لمشاكل جودة أو توقعات' : 'High RTO — check quality & expectations') : (isAr ? 'إرجاع ضمن الطبيعي' : 'RTO within normal')}</span></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <WidgetIcon id="cod-performance" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء الدفع عند الاستلام' : 'COD Performance'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'من التأكيد إلى التحصيل' : 'Confirmation → delivery → cash'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DashboardInfoButton
            title={isAr ? 'أداء الدفع عند الاستلام' : 'COD Performance'}
            description={isAr ? 'مهم جداً لمتاجر الدفع عند الاستلام: الطلب الموضوع ليس إيراداً حتى يتم تسليمه وتحصيله.' : 'Critical for COD stores: placed orders are not revenue until delivered and collected.'}
            bullets={isAr ? ['التأكيد = انتقال الطلب من معلق إلى مؤكد', 'نجاح التسليم = تم التسليم / (تم التسليم+ملغي+مرتجع)'] : ['Confirmation = pending → confirmed', 'Delivery success = delivered / (delivered+cancelled+refunded)']}
            hint={isAr ? 'البيانات من حالات الطلب والدفع الحالية.' : 'Data derived from current order & payment statuses.'}
          />
          {onExpand && (
            <button onClick={onExpand} title={isAr ? 'توسيع' : 'Expand'} className="w-7 h-7 rounded-full flex items-center justify-center border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:text-[var(--color-darkGreen)]">
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <p className="text-sm text-gray-400 dark:text-white/40 py-8 text-center">{isAr ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Bar label={isAr ? 'معدل التأكيد' : 'Confirmation Rate'} value={m.confirmationRate} color="var(--color-darkGreen, #047857)" />
            <Bar label={isAr ? 'نجاح التسليم' : 'Delivery Success'} value={m.deliverySuccess} color="#059669" />
            <Bar label={isAr ? 'معدل الإلغاء' : 'Cancellation Rate'} value={m.cancellationRate} color="#ef4444" />
            <Bar label={isAr ? 'الإرجاع / RTO' : 'Return / RTO'} value={m.rtoRate} color="#f59e0b" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-3 text-center">
              <Wallet size={14} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">{isAr ? 'تم تحصيله' : 'Cash Collected'}</p>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{m.cashCollected.toLocaleString()} MAD</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-3 text-center">
              <Hourglass size={14} className="mx-auto text-amber-600 dark:text-amber-400" />
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">{isAr ? 'معلق' : 'Cash Pending'}</p>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{m.cashPending.toLocaleString()} MAD</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 text-center">
              <BadgeCheck size={14} className="mx-auto text-gray-600 dark:text-gray-300" />
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">{isAr ? 'COD' : 'COD Orders'}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{m.codTotal}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-white/30 mt-3 text-center">{isAr ? 'متوسط وقت التسليم يتطلب بيانات الشحن — سيظهر هنا عند توفرها' : 'Avg. delivery time needs shipment timestamps — will appear when available'}</p>
        </>
      )}
    </div>
  );
};

export default CodPerformance;
