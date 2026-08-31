'use client';

import React, { useMemo } from 'react';
import { Globe, MapPin, TrendingUp } from 'lucide-react';
import type { CountryInfo } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { useStore } from '../../../store/useStore';
import { WidgetIcon } from '../../dashboard/workspace/icons';

const GeographicAnalytics: React.FC<{ countries: CountryInfo[]; isExpanded?: boolean }> = ({ countries, isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { orders } = useStore();

  const cityStats = useMemo(() => {
    const map = new Map<string, { city: string; orders: number; revenue: number }>();
    orders.forEach(o => {
      const city = (o.shippingAddress?.city || o.shippingAddress?.region || 'Unknown').trim() || 'Unknown';
      const cur = map.get(city) || { city, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += o.total;
      map.set(city, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.orders - a.orders).slice(0, 8);
  }, [orders]);

  const totalVisitors = countries.reduce((a, c) => a + c.count, 0);
  const totalOrders = cityStats.reduce((a, c) => a + c.orders, 0);

  const sortedCountries = useMemo(() => {
    return [...countries].slice(0, 10).sort((a, b) => b.count - a.count);
  }, [countries]);

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/10 flex items-center justify-center"><WidgetIcon id="geographic-analytics" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'التحليل الجغرافي — تفصيلي' : 'Geographic Analytics — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalVisitors.toLocaleString()} {isAr ? 'زائر من' : 'visitors from'} {countries.length} {isAr ? 'دول' : 'countries'} • {totalOrders.toLocaleString()} {isAr ? 'طلب من' : 'orders from'} {cityStats.length} {isAr ? 'مدن' : 'cities'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Globe size={16} className="text-teal-600" />{isAr ? 'الزوار حسب الدولة' : 'Visitors by Country'}</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/15 text-teal-700 dark:text-teal-300 font-medium">{countries.length} {isAr ? 'دول' : 'countries'}</span>
            </div>
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {sortedCountries.length ? sortedCountries.map((c, i) => {
                const pct = totalVisitors ? Math.round((c.count / totalVisitors) * 100) : 0;
                return (
                  <div key={c.country} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <span className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <Globe size={14} className="text-teal-500/70 shrink-0 hidden sm:block" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{c.country}</span>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{c.count.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-white/40">{pct}%</p>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-teal-100 dark:bg-white/10 overflow-hidden hidden sm:block"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              }) : <p className="text-sm text-gray-400 text-center py-8">{isAr ? 'لا توجد بيانات' : 'No geographic data'}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-amber-600" />{isAr ? 'الطلبات حسب المدينة' : 'Orders by City'}</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">{cityStats.length} {isAr ? 'مدن' : 'cities'}</span>
            </div>
            {cityStats.length ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {cityStats.map((cs, i) => {
                  const maxRev = Math.max(...cityStats.map(c => c.revenue), 1);
                  const w = Math.round((cs.revenue / maxRev) * 100);
                  return (
                    <div key={cs.city} className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-100 dark:border-amber-500/15">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{cs.city}</span>
                        </div>
                        <span className="text-sm font-bold text-amber-900 dark:text-amber-100">{cs.orders} {isAr ? 'طلب' : 'orders'}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300">{cs.revenue.toLocaleString()} MAD</span>
                        <span className="text-gray-500 dark:text-white/40 flex items-center gap-1"><TrendingUp size={12} />{w}% {isAr ? 'من الأعلى' : 'of top'}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-amber-200/50 dark:bg-white/10 overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${w}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <MapPin size={24} className="mx-auto text-gray-300 dark:text-white/20 mb-2" />
                <p className="text-sm text-gray-500 dark:text-white/40">{isAr ? 'لا توجد مدن بعد' : 'No city data yet'}</p>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{isAr ? 'سيظهر عند وصول طلبات بعناوين شحن' : 'Will appear when orders with shipping addresses arrive'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-teal-50 dark:bg-teal-500/5 border border-teal-100 dark:border-teal-500/10 p-4">
          <p className="text-xs font-semibold text-teal-800 dark:text-teal-200">{isAr ? '💡 نصيحة' : '💡 Insight'}</p>
          <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">{isAr ? 'ركز حملاتك على المدن الأعلى طلباً والأعلى تحويلاً. استخدم هذا لتخصيص الشحن والعروض.' : 'Focus campaigns on highest-order cities. Use this to tailor shipping and offers.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <WidgetIcon id="geographic-analytics" />
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'التحليل الجغرافي' : 'Geographic Analytics'}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'الزوار والطلبات حسب المنطقة' : 'Visitors & orders by region'}</p>
        </div>
        <AnalyticsInfoButton title={isAr ? 'التحليل الجغرافي' : 'Geographic Analytics'} description={isAr ? 'الزوار حسب الدولة والطلبات حسب المدينة — مع فصل واضح وتصميم جميل.' : 'Visitors by country and orders by city — clearly separated with beautiful design.'} />
      </div>

      <div className="flex-1 min-h-0 overflow-auto overscroll-contain space-y-3 pr-1">
        {/* Countries — visitors */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300 mb-2 flex items-center gap-1.5"><Globe size={12} />{isAr ? 'الزوار حسب الدولة' : 'Visitors by Country'}</p>
          <div className="space-y-2">
            {sortedCountries.length ? sortedCountries.slice(0, 5).map((c, i) => {
              const pct = totalVisitors ? Math.round((c.count / totalVisitors) * 100) : 0;
              return (
                <div key={c.country} className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-500/5 border border-teal-100/50 dark:border-teal-500/10">
                  <span className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <Globe size={12} className="text-teal-500/60 hidden sm:block shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{c.country}</span>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-white/10 border border-teal-100 dark:border-white/10 px-2 py-1 rounded-full shrink-0">{c.count} • {pct}%</span>
                </div>
              );
            }) : <p className="text-sm text-gray-400 text-center py-4">{isAr ? 'لا توجد بيانات' : 'No country data'}</p>}
          </div>
        </div>

        {/* Cities — orders */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5"><MapPin size={12} />{isAr ? 'الطلبات حسب المدينة' : 'Orders by City'}</p>
          <div className="space-y-2">
            {cityStats.length ? cityStats.slice(0, 4).map((cs, i) => (
              <div key={cs.city} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{cs.city}</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-white/10 border border-amber-100 dark:border-white/10 px-2 py-1 rounded-full shrink-0">{cs.orders} • {cs.revenue.toLocaleString()} MAD</span>
              </div>
            )) : <p className="text-sm text-gray-400 text-center py-4">{isAr ? 'لا توجد مدن' : 'No cities yet'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicAnalytics;
