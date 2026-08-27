'use client';

import React, { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import type { CountryInfo } from '../types';
import AnalyticsInfoButton from './AnalyticsInfoButton';
import { useTranslation } from '../../../i18n/useTranslation';
import { useStore } from '../../../store/useStore';

const GeographicAnalytics: React.FC<{ countries: CountryInfo[] }> = ({ countries }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { orders } = useStore();
  const [sortBy, setSortBy] = useState<'visitors' | 'orders' | 'conversion'>('visitors');

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

  const visitorTotal = countries.reduce((a, c) => a + c.count, 0);

  const countryRows = useMemo(() => {
    return [...countries].slice(0, 8).map(c => {
      const cityMatch = cityStats.find(cs => cs.city.toLowerCase() === c.country.toLowerCase());
      const cityOrders = cityMatch?.orders ?? 0;
      const cityRevenue = cityMatch?.revenue ?? 0;
      const conv = c.count ? ((cityOrders / c.count) * 100).toFixed(2) : '0.00';
      return { ...c, orders: cityOrders, revenue: cityRevenue, conv: parseFloat(conv) };
    }).sort((a, b) => {
      if (sortBy === 'orders') return b.orders - a.orders;
      if (sortBy === 'conversion') return b.conv - a.conv;
      return b.count - a.count;
    });
  }, [countries, cityStats, sortBy]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'التحليل الجغرافي' : 'Geographic Analytics'}</h3>
          <AnalyticsInfoButton title={isAr ? 'التحليل الجغرافي' : 'Geographic Analytics'} description={isAr ? 'للبلد والمدينة: الزوار والطلبات ومعدل التحويل والإيراد. ركز على المدن الأعلى تحويلاً.' : 'Country & city: visitors, orders, conversion & revenue. Focus on highest-converting cities.'} />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 self-start">
          {([
            { v: 'visitors', l: isAr ? 'زوار' : 'Visitors' },
            { v: 'orders', l: isAr ? 'طلبات' : 'Orders' },
            { v: 'conversion', l: isAr ? 'تحويل' : 'Conv' },
          ] as const).map(o => (
            <button key={o.v} onClick={() => setSortBy(o.v)} className={`px-2.5 py-1.5 text-xs font-medium rounded-lg ${sortBy === o.v ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{o.l}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {countryRows.length ? countryRows.map(c => (
          <div key={c.country} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <Globe size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.country}</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0">
              <span className="text-gray-600 dark:text-gray-300"><span className="hidden sm:inline">{isAr ? 'زوار:' : 'Visitors:'} </span>{c.count}</span>
              <span className="font-semibold text-gray-900 dark:text-white"><span className="hidden sm:inline">{isAr ? 'طلبات:' : 'Orders:'} </span>{c.orders}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium ${c.conv > 5 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>{c.conv.toFixed(2)}%</span>
              <span className="hidden md:inline text-gray-500 dark:text-gray-400">{c.revenue.toLocaleString()} MAD</span>
            </div>
          </div>
        )) : <p className="text-sm text-gray-400 text-center py-6">{isAr ? 'لا توجد بيانات جغرافية' : 'No geographic data'}</p>}
      </div>

      {cityStats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{isAr ? 'أعلى المدن (من عناوين الشحن)' : 'Top Cities (from shipping addresses)'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cityStats.slice(0, 4).map(cs => (
              <div key={cs.city} className="rounded-xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-2.5 text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cs.city}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{cs.orders} {isAr ? 'طلب' : 'orders'} • {cs.revenue.toLocaleString()} MAD</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeographicAnalytics;
