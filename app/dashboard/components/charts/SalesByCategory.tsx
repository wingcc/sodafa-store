// SODFA MARKETPLACE - Sales by Category Chart

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categorySales } from '../../data/mockData';

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

const SalesByCategory: React.FC = () => {
  const total = categorySales.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">Sales by Category</h3>
        <p className="text-sm text-gray-500 mt-0.5">Revenue distribution across categories</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-2 mt-2">
          {categorySales.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {item.value.toLocaleString()} MAD
                </span>
                <span className="text-xs text-gray-400">
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesByCategory;
