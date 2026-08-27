'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardInfoButton from './DashboardInfoButton';
import { useTranslation } from '../../i18n/useTranslation';

type TimeRange = '7d' | '30d' | '90d';
interface RevenuePoint { date: string; revenue: number; orders: number; }

const timeRanges: { value: TimeRange; label: string; labelAr: string }[] = [
  { value: '7d', label: '7 Days', labelAr: '7 أيام' },
  { value: '30d', label: '30 Days', labelAr: '30 يوم' },
  { value: '90d', label: '90 Days', labelAr: '90 يوم' },
];

const RevenueOverview: React.FC = () => {
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'نظرة عامة على الإيرادات' : 'Revenue Overview'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'الإيرادات اليومية والطلبات' : 'Daily revenue & orders'}</p>
          </div>
          <DashboardInfoButton
            title={isAr ? 'نظرة عامة على الإيرادات' : 'Revenue Overview'}
            description={isAr ? 'يعرض تطور الإيرادات والطلبات يومياً. يساعدك على ربط حملاتك بالمبيعات.' : 'Shows daily revenue and order trends. Correlate campaigns with sales.'}
            bullets={isAr ? ['المنطقة الخضراء = الإيرادات', 'المنطقة الذهبية = عدد الطلبات'] : ['Green area = revenue', 'Gold area = order count']}
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 self-start sm:self-auto">
          {timeRanges.map(r => (
            <button key={r.value} onClick={() => setTimeRange(r.value)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${timeRange === r.value ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>
              {isAr ? r.labelAr : r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 min-h-[220px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-darkGreen, #047857)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-darkGreen, #047857)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-darkGreen, #047857)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gold, #d97706)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-gold, #d97706)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatDate} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--dashboard-card-dark, #131a28)', border: 'none', borderRadius: '12px', color: '#fff' } as any} labelFormatter={(l: any) => formatDate(l)} formatter={((v: any, n: any) => n === 'revenue' ? [`${Number(v).toLocaleString()} MAD`, isAr ? 'الإيرادات' : 'Revenue'] : [v, isAr ? 'الطلبات' : 'Orders']) as any} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-darkGreen, #047857)" strokeWidth={2.4} fill="url(#revDark)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-darkGreen, #047857)', fill: '#fff' }} />
              <Area type="monotone" dataKey="orders" stroke="var(--color-gold, #d97706)" strokeWidth={2} fill="url(#revGold)" dot={false} activeDot={{ r: 3, strokeWidth: 2, stroke: 'var(--color-gold, #d97706)', fill: '#fff' }} />
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
