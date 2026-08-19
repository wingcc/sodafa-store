// SODFA MARKETPLACE - Analytics Page

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import { salesData, categorySales } from '../data/mockData';

const weeklyData = [
  { day: 'Mon', revenue: 3200, orders: 11 },
  { day: 'Tue', revenue: 2800, orders: 9 },
  { day: 'Wed', revenue: 4100, orders: 14 },
  { day: 'Thu', revenue: 3500, orders: 12 },
  { day: 'Fri', revenue: 5200, orders: 18 },
  { day: 'Sat', revenue: 4800, orders: 16 },
  { day: 'Sun', revenue: 3100, orders: 10 },
];

const cityData = [
  { name: 'Casablanca', value: 42500 },
  { name: 'Rabat', value: 28300 },
  { name: 'Marrakech', value: 22100 },
  { name: 'Tangier', value: 15800 },
  { name: 'Agadir', value: 11200 },
  { name: 'Fez', value: 5550 },
];

const COLORS = ['#C084FC', '#F472B6', '#FB923C', '#38BDF8', '#4ADE80', '#FBBF24'];

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track your store performance</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {['7d', '30d', '3m', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value="125,450 MAD" change={18.5} changeLabel="vs last month" icon={<DollarSign size={22} />} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Orders" value="847" change={12.3} changeLabel="vs last month" icon={<ShoppingCart size={22} />} iconBg="bg-pink-50" iconColor="text-pink-600" />
        <StatCard title="Customers" value="342" change={22.1} changeLabel="vs last month" icon={<Users size={22} />} iconBg="bg-sky-50" iconColor="text-sky-600" />
        <StatCard title="Avg. Order Value" value="148 MAD" change={5.2} changeLabel="vs last month" icon={<BarChart3 size={22} />} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [`${value.toLocaleString()} MAD`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#C084FC" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by City */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Sales by City</h3>
          <div className="flex items-center gap-6">
            <div className="h-[220px] w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {cityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString()} MAD`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {cityData.map((city, i) => (
                <div key={city.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-gray-600">{city.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{city.value.toLocaleString()} MAD</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Conversion Rate', value: '3.2%', change: 0.5, icon: <TrendingUp size={16} /> },
          { label: 'Customer Retention', value: '68%', change: 5.1, icon: <Users size={16} /> },
          { label: 'Return Rate', value: '2.1%', change: -0.3, icon: <TrendingDown size={16} /> },
          { label: 'Avg. Delivery Time', value: '2.3 days', change: -0.2, icon: <Package size={16} /> },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold ${metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
