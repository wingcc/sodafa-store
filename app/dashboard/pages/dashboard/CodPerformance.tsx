'use client';

import React from 'react';
import { Truck, BadgeCheck, XCircle, Undo2, Wallet, Hourglass } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { getCodMetrics } from './utils';
import type { Order } from '../../types';

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

const CodPerformance: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const m = getCodMetrics(orders);
  const hasData = orders.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}>
            <Truck size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? 'أداء الدفع عند الاستلام' : 'COD Performance'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'من التأكيد إلى التحصيل' : 'Confirmation → delivery → cash'}</p>
          </div>
        </div>
        <DashboardInfoButton
          title={isAr ? 'أداء الدفع عند الاستلام' : 'COD Performance'}
          description={isAr ? 'مهم جداً لمتاجر الدفع عند الاستلام: الطلب الموضوع ليس إيراداً حتى يتم تسليمه وتحصيله.' : 'Critical for COD stores: placed orders are not revenue until delivered and collected.'}
          bullets={isAr ? ['التأكيد = انتقال الطلب من معلق إلى مؤكد', 'نجاح التسليم = تم التسليم / (تم التسليم+ملغي+مرتجع)'] : ['Confirmation = pending → confirmed', 'Delivery success = delivered / (delivered+cancelled+refunded)']}
          hint={isAr ? 'البيانات من حالات الطلب والدفع الحالية.' : 'Data derived from current order & payment statuses.'}
        />
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
