// SODFA MARKETPLACE - Store Sales by Category Chart (Real Order Data)

'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#1E7A57', '#C6A15B', '#38BDF8', '#F472B6', '#FB923C', '#4ADE80', '#FBBF24', '#C084FC'];

interface CategorySales {
  category: string;
  revenue: number;
  orders: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3">
        <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600 mt-1">{payload[0].value.toLocaleString()} MAD</p>
      </div>
    );
  }
  return null;
};

const SalesByCategoryChart: React.FC = () => {
  const [data, setData] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/orders?status=all');
        const json = await res.json();
        const orders = json.orders || json.data || [];

        // Aggregate by category (using first item's category)
        const catMap = new Map<string, { revenue: number; orderCount: number }>();
        for (const order of orders) {
          const items = order.items || order.order_items || [];
          for (const item of items) {
            const cat = item.category || item.category_name || item.categoryName || 'Other';
            if (!catMap.has(cat)) {
              catMap.set(cat, { revenue: 0, orderCount: 0 });
            }
            const c = catMap.get(cat)!;
            c.revenue += (item.price || 0) * (item.quantity || 1);
            c.orderCount++;
          }
        }

        const result: CategorySales[] = Array.from(catMap.entries())
          .map(([category, d]) => ({ category, revenue: d.revenue, orders: d.orderCount }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 6);

        setData(result);
      } catch (error) {
        console.error('[SalesByCategoryChart] Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">Sales by Category</h3>
        <p className="text-sm text-gray-500 mt-0.5">Revenue distribution</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="h-[200px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#1E7A57] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="revenue"
                  nameKey="category"
                  stroke="none"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No category data yet
            </div>
          )}
        </div>

        <div className="w-full space-y-2 mt-2">
          {data.map((item, i) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {item.revenue.toLocaleString()} MAD
                </span>
                <span className="text-xs text-gray-400">
                  {total > 0 ? `${((item.revenue / total) * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesByCategoryChart;
