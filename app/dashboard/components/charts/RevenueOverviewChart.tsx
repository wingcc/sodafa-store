// SODFA MARKETPLACE - Store Revenue Overview Chart (Real Order Data)

'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type TimeRange = '7d' | '30d' | '90d';

interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 min-w-[160px]">
        <p className="text-xs text-gray-500 mb-2">{label}</p>
        <p className="text-sm font-semibold text-gray-900">
          Revenue: {payload[0].value.toLocaleString()} MAD
        </p>
        {payload[1] && (
          <p className="text-sm font-semibold text-gray-600">
            Orders: {payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const RevenueOverviewChart: React.FC = () => {
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

        const res = await fetch(
          `/api/orders?status=all&dateFrom=${start.toISOString()}&dateTo=${now.toISOString()}`
        );
        const json = await res.json();
        const orders = json.orders || json.data || [];

        // Aggregate by date
        const bucketMap = new Map<string, { revenue: number; orderCount: number }>();
        for (const order of orders) {
          const date = order.created_at?.substring(0, 10) || 'unknown';
          if (!bucketMap.has(date)) {
            bucketMap.set(date, { revenue: 0, orderCount: 0 });
          }
          const b = bucketMap.get(date)!;
          b.revenue += order.total || 0;
          b.orderCount++;
        }

        const trend: RevenuePoint[] = Array.from(bucketMap.entries())
          .map(([date, d]) => ({ date, revenue: d.revenue, orders: d.orderCount }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setData(trend);
      } catch (error) {
        console.error('[RevenueOverviewChart] Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500 mt-0.5">Daily revenue & orders</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timeRange === range.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#1E7A57] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E7A57" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1E7A57" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6A15B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={formatDate}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#1E7A57"
                strokeWidth={2.5}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#1E7A57', fill: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#C6A15B"
                strokeWidth={2}
                fill="url(#colorOrders)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#C6A15B', fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No revenue data yet
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
