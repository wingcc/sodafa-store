// SODFA MARKETPLACE - Revenue Chart Component

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { salesData } from '../../data/mockData';

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 min-w-[160px]">
        <p className="text-xs text-gray-500 mb-2">{label}</p>
        <p className="text-lg font-bold text-gray-900">
          {payload[0].value.toLocaleString()} MAD
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500 mt-0.5">Daily revenue trends</p>
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C084FC" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C084FC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { weekday: 'short' });
              }}
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
              stroke="#C084FC"
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#C084FC', fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
