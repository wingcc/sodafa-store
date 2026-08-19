// SODFA MARKETPLACE - Stat Card Component

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeLabel, icon, iconBg, iconColor }) => {
  const isPositive = change && change >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {isPositive ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span
                className={`text-xs font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
