'use client';

import React, { useEffect, useState } from 'react';
import type { SummaryStats } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { WidgetIcon } from '../../dashboard/workspace/icons';

interface Props { stats: SummaryStats | null; period: string; }

interface CartStats {
  addToCart: number;
  checkoutStarted: number;
  orders: number;
  hasRealData: boolean;
}

const CartAbandonment: React.FC<Props> = ({ stats, period }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [cartStats, setCartStats] = useState<CartStats | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCart(true);
    fetch(`/api/analytics/dashboard?view=cart&period=${period}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setCartStats(data); })
      .catch(() => { if (!cancelled) setCartStats(null); })
      .finally(() => { if (!cancelled) setLoadingCart(false); });
    return () => { cancelled = true; };
  }, [period]);

  // Use real data when available, otherwise estimate from visitors/orders
  const visitors = stats?.visitors.value ?? 0;
  const ordersFromStats = stats?.orders.value ?? 0;

  const hasRealData = cartStats?.hasRealData ?? false;
  const addToCart = hasRealData
    ? (cartStats?.addToCart ?? 0)
    : Math.round(Math.round(visitors * 0.62) * 0.27);
  // If we have real addToCart but no checkout, estimate checkout; otherwise use real
  const checkout = hasRealData
    ? (cartStats?.checkoutStarted ?? 0) || Math.round(addToCart * 0.66)
    : Math.round(addToCart * 0.66);
  const orders = hasRealData ? (cartStats?.orders ?? ordersFromStats) : ordersFromStats;

  const abandonCart = addToCart ? Math.round(((addToCart - checkout) / addToCart) * 100) : 0;
  const abandonCheckout = checkout ? Math.round(((checkout - orders) / checkout) * 100) : 0;

  const hasData = hasRealData || (visitors > 0 && addToCart > 0) || orders > 0;
  const isEstimated = !hasRealData;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="cart-abandonment" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'التخلي عن السلة' : 'Cart & Checkout Abandonment'}</h3>
        <AnalyticsInfoButton title={isAr ? 'التخلي عن السلة' : 'Abandonment'} description={isAr ? 'يقارن من أضاف للسلة وبدأ الشراء وأكمل الطلب. المعدل المرتفع يشير لمشاكل سعر/شحن/ثقة.' : 'Compares add-to-cart vs checkout vs completed orders. High abandonment signals price/shipping/trust issues.'} />
      </div>

      {loadingCart ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-white/10 border-t-[var(--color-darkGreen)] rounded-full animate-spin" />
        </div>
      ) : !hasData ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-white/40">{isAr ? 'لا توجد بيانات بعد' : 'No data yet'}</p>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-1 max-w-[260px] mx-auto">
            {isAr
              ? 'لم يتم تسجيل زوار أو طلبات في هذه الفترة. سيظهر التخلي عن السلة تلقائياً عند توفر تتبع visitor_events (add_to_cart / begin_checkout).'
              : 'No visitors or orders in this period. Cart abandonment will appear automatically once visitor_events tracking (add_to_cart / begin_checkout) is active.'}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-white/20 mt-2">Data source: visitor_events + orders</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'أضاف للسلة' : 'Add to Cart'}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{addToCart.toLocaleString()}</p>
              {isEstimated && <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{isAr ? 'تقديري' : 'estimated'}</p>}
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">{isAr ? 'بدأ الشراء' : 'Checkout'}</p>
              <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">{checkout.toLocaleString()}</p>
              {isEstimated && <p className="text-[10px] text-amber-600/60 dark:text-amber-300/50 mt-0.5">{isAr ? 'تقديري' : 'estimated'}</p>}
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{isAr ? 'طلبات' : 'Orders'}</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-1">{orders.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-300">{isAr ? 'التخلي عن السلة' : 'Cart abandonment'}</span><span className="font-semibold text-amber-600">{abandonCart}%</span></div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${abandonCart}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-300">{isAr ? 'التخلي عند الدفع' : 'Checkout abandonment'}</span><span className="font-semibold text-red-600">{abandonCheckout}%</span></div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${abandonCheckout}%` }} /></div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-white/30 mt-3 text-center">
            {isEstimated
              ? (isAr ? 'تقديرات من الزوار والطلبات — سيتم استبدالها ببيانات حقيقية عند تفعيل تتبع السلة.' : 'Estimates from visitors & orders — replaced by real data once cart tracking is active.')
              : (isAr ? 'بيانات حقيقية من visitor_events والطلبات.' : 'Real data from visitor_events & orders.')}
          </p>
        </>
      )}
    </div>
  );
};

export default CartAbandonment;
