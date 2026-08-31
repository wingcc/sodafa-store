'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DashboardInfoButton from './DashboardInfoButton';
import { useTranslation } from '../../i18n/useTranslation';
import { WidgetIcon } from './workspace/icons';

const COLORS = ['var(--color-darkGreen, #047857)', 'var(--color-gold, #d97706)', '#0ea5e9', '#a78bfa', '#f59e0b', '#10b981', '#f472b6', '#38bdf8'];
const FALLBACK = ['#047857', '#d97706', '#0ea5e9', '#a78bfa', '#f59e0b', '#10b981'];

interface CatSales { category: string; revenue: number; orders: number; }

const SalesByCategoryCard: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = false }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [data, setData] = useState<CatSales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/orders?status=all');
        const json = await res.json();
        const orders = json.orders || json.data || [];
        const catMap = new Map<string, { revenue: number; orderCount: number }>();
        for (const order of orders) {
          const items = order.items || order.order_items || [];
          for (const item of items) {
            const cat = item.category || item.category_name || item.categoryName || 'Other';
            if (!catMap.has(cat)) catMap.set(cat, { revenue: 0, orderCount: 0 });
            const c = catMap.get(cat)!;
            c.revenue += (item.price || item.unit_price || item.unitPrice || 0) * (item.quantity || 1);
            c.orderCount++;
          }
        }
        const result: CatSales[] = Array.from(catMap.entries()).map(([category, d]) => ({ category, revenue: d.revenue, orders: d.orderCount })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
        setData(result);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const total = data.reduce((s, i) => s + i.revenue, 0);

  if (isExpanded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><WidgetIcon id="sales-by-category" /></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isAr ? 'المبيعات حسب الفئة — تفصيلي' : 'Sales by Category — Detailed'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} MAD • {data.length} {isAr ? 'فئات' : 'categories'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <div className="h-[360px]">
              {loading ? (
                <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={3} dataKey="revenue" nameKey="category" stroke="none">
                      {data.map((_, i) => <Cell key={i} fill={FALLBACK[i % FALLBACK.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } as any} formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, isAr ? 'الإيرادات' : 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">{isAr ? 'لا توجد بيانات' : 'No data'}</div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{isAr ? 'التفاصيل' : 'Breakdown'}</h4>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {data.map((item, i) => (
                <div key={item.category} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: FALLBACK[i % FALLBACK.length] }} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{item.category}</span>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.revenue.toLocaleString()} MAD</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{item.orders} {isAr ? 'طلب' : 'orders'} • {total ? ((item.revenue / total) * 100).toFixed(1) : '0'}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="sales-by-category" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isAr ? 'المبيعات حسب الفئة' : 'Sales by Category'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'توزيع الإيرادات' : 'Revenue distribution'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DashboardInfoButton title={isAr ? 'المبيعات حسب الفئة' : 'Sales by Category'} description={isAr ? 'يعرض الفئات الأكثر تحقيقاً للإيرادات. ركز تسويقك ومخزونك عليها.' : 'Shows which categories drive most revenue. Focus marketing & stock there.'} />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex-1 min-h-0 min-h-[200px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[var(--color-darkGreen, #047857)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="revenue" nameKey="category" stroke="none">
                  {data.map((_, i) => <Cell key={i} fill={FALLBACK[i % FALLBACK.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0' }} formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, isAr ? 'الإيرادات' : 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-white/40 text-sm">{isAr ? 'لا توجد بيانات' : 'No category data yet'}</div>
          )}
        </div>
        <div className="w-full space-y-2 mt-2">
          {data.map((item, i) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: FALLBACK[i % FALLBACK.length] }} />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.revenue.toLocaleString()} MAD</span>
                <span className="text-xs text-gray-400">{total ? `${((item.revenue / total) * 100).toFixed(0)}%` : '0%'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesByCategoryCard;
