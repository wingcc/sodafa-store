'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardInfoButton from './DashboardInfoButton';
import { useTranslation } from '../../i18n/useTranslation';
import { WidgetIcon } from './workspace/icons';

type TimeRange = '7d' | '30d' | '90d';
interface RevenuePoint { date: string; revenue: number; orders: number; }

const timeRanges: { value: TimeRange; label: string; labelAr: string }[] = [
  { value: '7d', label: '7 Days', labelAr: '7 أيام' },
  { value: '30d', label: '30 Days', labelAr: '30 يوم' },
  { value: '90d', label: '90 Days', labelAr: '90 يوم' },
];

const RevenueOverview: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let start: Date;
        if (timeRange === '7d') start = new Date(now.getTime() - 7 * 86400000);
        else if (timeRange === '30d') start = new Date(now.getTime() - 30 * 86400000);
        else start = new Date(now.getTime() - 90 * 86400000);
        const res = await fetch(`/api/orders?status=all&dateFrom=${start.toISOString()}&dateTo=${now.toISOString()}`);
        const json = await res.json();
        const orders = json.orders || json.data || [];
        const bucketMap = new Map<string, { revenue: number; orderCount: number }>();
        for (const order of orders) {
          const date = order.created_at?.substring(0, 10) || 'unknown';
          if (!bucketMap.has(date)) bucketMap.set(date, { revenue: 0, orderCount: 0 });
          const b = bucketMap.get(date)!;
          b.revenue += order.total || 0;
          b.orderCount++;
        }
        const trend: RevenuePoint[] = Array.from(bucketMap.entries()).map(([date, d]) => ({ date, revenue: d.revenue, orders: d.orderCount })).sort((a, b) => a.date.localeCompare(b.date));
        setData(trend);
      } catch (e) { console.error('[RevenueOverview] fetch failed', e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [timeRange]);

  const formatDate = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString(isAr ? 'ar-MA' : 'en', { month: 'short', day: 'numeric' });

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const avgRevenue = data.length ? Math.round(totalRevenue / data.length) : 0;

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><WidgetIcon id="revenue-overview" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'الإيرادات — تحليل مفصل' : 'Revenue — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{totalRevenue.toLocaleString()} MAD • {totalOrders} {isAr ? 'طلب' : 'orders'} • {data.length} {isAr ? 'يوم' : 'days'}</p>
          </div>
          <div className="ml-auto flex bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            {timeRanges.map(r => (
              <button key={r.value} onClick={() => setTimeRange(r.value)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${timeRange === r.value ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{isAr ? r.labelAr : r.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 p-4 text-center">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{isAr ? 'الإجمالي' : 'Total Revenue'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalRevenue.toLocaleString()} MAD</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{avgRevenue.toLocaleString()} {isAr ? '/ يوم' : '/ day avg'}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 p-4 text-center">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{isAr ? 'الطلبات' : 'Orders'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalOrders}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{data.length ? (totalOrders / data.length).toFixed(1) : '0'} {isAr ? '/ يوم' : '/ day'}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15 p-4 text-center">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">{isAr ? 'متوسط الطلب' : 'Avg Order'}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalOrders ? Math.round(totalRevenue / totalOrders).toLocaleString() : '0'} MAD</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
          <div className="h-[380px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revAreaGradLg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="95%" stopColor="#10b981" stopOpacity={0.0} /></linearGradient>
                    <linearGradient id="ordersAreaGradLg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.12)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#f59e0b' }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' } as any} labelFormatter={(l: any) => formatDate(l)} formatter={((v: any, n: any) => n === 'revenue' ? [`${Number(v).toLocaleString()} MAD`, isAr ? 'الإيرادات' : 'Revenue'] : [v, isAr ? 'الطلبات' : 'Orders']) as any} />
                  <Area yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#f59e0b" strokeWidth={2.4} strokeDasharray="4 2" fill="url(#ordersAreaGradLg)" dot={false} activeDot={{ r: 4, stroke: '#f59e0b', fill: '#fff' }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={2.8} fill="url(#revAreaGradLg)" dot={false} activeDot={{ r: 5, stroke: '#10b981', fill: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">{isAr ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'التفاصيل اليومية' : 'Daily Breakdown'}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 dark:text-white/40 text-left border-b border-gray-100 dark:border-white/10"><th className="pb-2 font-medium">{isAr ? 'التاريخ' : 'Date'}</th><th className="pb-2 font-medium text-right">{isAr ? 'الإيرادات' : 'Revenue'}</th><th className="pb-2 font-medium text-right">{isAr ? 'الطلبات' : 'Orders'}</th><th className="pb-2 font-medium text-right">{isAr ? 'متوسط' : 'Avg'}</th></tr></thead>
              <tbody>
                {data.slice(-10).reverse().map(d => (
                  <tr key={d.date} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                    <td className="py-2 text-gray-700 dark:text-gray-300">{formatDate(d.date)}</td>
                    <td className="py-2 text-right font-bold text-emerald-700 dark:text-emerald-300">{d.revenue.toLocaleString()} MAD</td>
                    <td className="py-2 text-right text-gray-700 dark:text-gray-300">{d.orders}</td>
                    <td className="py-2 text-right text-gray-500 dark:text-white/40">{d.orders ? Math.round(d.revenue / d.orders).toLocaleString() : '—'} MAD</td>
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="revenue-overview" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'نظرة عامة على الإيرادات' : 'Revenue Overview'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'منحنيات الإيرادات والطلبات اليومية' : 'Daily revenue & order trends'}</p>
          </div>
          <DashboardInfoButton
            title={isAr ? 'نظرة عامة على الإيرادات' : 'Revenue Overview'}
            description={isAr ? 'يعرض تطور الإيرادات والطلبات يومياً بمنحنيات انسيابية مضيئة.' : 'Shows smooth glowing revenue and order trend curves.'}
            bullets={isAr ? ['المنحنى الأخضر = الإيرادات (MAD)', 'المنحنى الذهبي = عدد الطلبات'] : ['Green Curve = Revenue (MAD)', 'Amber Curve = Order Count']}
          />
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs inline-block" /> {isAr ? 'الإيرادات' : 'Revenue'}
            </span>
            <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs inline-block" /> {isAr ? 'الطلبات' : 'Orders'}
            </span>
          </div>

          <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            {timeRanges.map(r => (
              <button key={r.value} onClick={() => setTimeRange(r.value)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${timeRange === r.value ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>
                {isAr ? r.labelAr : r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 min-h-[220px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-darkGreen, #047857)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.12)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#f59e0b' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' } as any}
                labelFormatter={(l: any) => formatDate(l)}
                formatter={((v: any, n: any) => n === 'revenue' ? [`${Number(v).toLocaleString()} MAD`, isAr ? 'الإيرادات' : 'Revenue'] : [v, isAr ? 'الطلبات' : 'Orders']) as any}
              />
              <Area yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#f59e0b" strokeWidth={2.4} strokeDasharray="4 2" fill="url(#ordersAreaGrad)" dot={false} activeDot={{ r: 4, stroke: '#f59e0b', fill: '#fff' }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={2.8} fill="url(#revAreaGrad)" dot={false} activeDot={{ r: 5, stroke: '#10b981', fill: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-white/40 text-sm">{isAr ? 'لا توجد بيانات بعد' : 'No revenue data yet'}</div>
        )}
      </div>
    </div>
  );
};

export default RevenueOverview;
