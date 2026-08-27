'use client';

import React, { useId } from 'react';
import { DollarSign, CreditCard, Clock, RotateCcw, Users, Package, AlertTriangle, PackageX, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import DashboardInfoButton from './DashboardInfoButton';
import { buildRevenueSparkline, sparklinePath } from './utils';
import type { Order, Product, Customer } from '../../types';

interface Props {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  refunded: number;
  pendingCount: number;
  refundedCount: number;
}

const ComboSpark: React.FC<{ values: number[]; strokeColor: string }> = ({ values, strokeColor }) => {
  const gradId = useId().replace(/:/g, '');
  if (!values.length || values.every(v => v === 0)) {
    return <div className="h-6 flex items-center justify-center text-[10px] text-gray-300 dark:text-white/20 font-mono">— live metrics —</div>;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 100;
  const H = 22;

  const barCount = values.length;
  const gap = 2.5;
  const barW = Math.max((W - (barCount - 1) * gap) / barCount, 2);

  const path = values.map((v, i) => {
    const x = i * (barW + gap) + barW / 2;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-6 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {values.map((v, i) => {
        const x = i * (barW + gap);
        const normH = Math.max(((v - min) / range) * (H - 4), 3);
        const y = H - normH;
        return (
          <rect
            key={i}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            width={barW.toFixed(1)}
            height={normH.toFixed(1)}
            rx="1.5"
            fill={strokeColor}
            fillOpacity={0.2}
          />
        );
      })}

      <path d={`${path} L${W},${H} L0,${H} Z`} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const KpiCard: React.FC<{
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  strokeColor: string;
  sparkline: number[];
  badge?: { label: string; positive?: boolean };
  infoTitle: string;
  infoDesc: string;
  infoBullets?: string[];
}> = ({ title, value, sub, icon, accent, strokeColor, sparkline, badge, infoTitle, infoDesc, infoBullets }) => {
  return (
    <div className="relative bg-white dark:bg-gray-900/90 rounded-xl p-3 sm:p-3.5 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 shadow-xs hover:shadow-lg transition-all duration-200 group flex flex-col justify-between min-h-0">
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform" style={{ background: accent }}>
              {icon}
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">{title}</p>
          </div>
          <DashboardInfoButton title={infoTitle} description={infoDesc} bullets={infoBullets} />
        </div>

        <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
          <p className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">{value}</p>
          {badge && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${badge.positive === true ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : badge.positive === false ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
              {badge.positive === true && <TrendingUp size={10} />}
              {badge.positive === false && <TrendingDown size={10} />}
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate font-medium">{sub}</p>
      </div>

      <div className="mt-2 pt-0.5">
        <ComboSpark values={sparkline} strokeColor={strokeColor} />
      </div>
    </div>
  );
};

const KpiGrid: React.FC<Props> = ({ orders, products, customers, totalRevenue, paidRevenue, pendingRevenue, refunded, pendingCount, refundedCount }) => {
  const { t, language } = useTranslation();
  const isAr = language === 'ar';

  const sparkRev = buildRevenueSparkline(orders, 7);
  const sparkPaid = buildRevenueSparkline(orders.filter(o => o.paymentStatus === 'paid'), 7);
  const sparkPending = buildRevenueSparkline(orders.filter(o => o.paymentStatus === 'pending'), 7);
  const sparkRefund = buildRevenueSparkline(orders.filter(o => o.orderStatus === 'refunded'), 7);

  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const sparkProducts = (() => {
    const v = products.map(p => p.stock);
    const avg = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
    return [avg * 0.8, avg * 1.1, avg * 0.95, avg, avg * 1.05, avg * 0.9, avg];
  })();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title={isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={`${totalRevenue.toLocaleString()} MAD`}
          sub={isAr ? `${orders.length} طلب إجمالي` : `${orders.length} orders total`}
          icon={<DollarSign size={16} />}
          accent="linear-gradient(135deg, #047857, #10b981)"
          strokeColor="#10b981"
          sparkline={sparkRev}
          badge={{ label: isAr ? 'أول تايم' : 'All-time', positive: true }}
          infoTitle={isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
          infoDesc={isAr ? 'مجموع قيمة كل الطلبات بغض النظر عن حالة الدفع. يوضح حجم المبيعات الكلي.' : 'Sum of all order totals regardless of payment status. Shows overall sales volume.'}
          infoBullets={isAr ? ['يشمل المدفوع والمعلق والمسترجع', 'استخدم الاتجاه لمعرفة نمو المبيعات'] : ['Includes paid, pending & refunded', 'Use the sparkline to spot growth']}
        />
        <KpiCard
          title={isAr ? 'الإيرادات المدفوعة' : 'Paid Revenue'}
          value={`${paidRevenue.toLocaleString()} MAD`}
          sub={isAr ? 'مدفوعات مكتملة' : 'Completed payments'}
          icon={<CreditCard size={16} />}
          accent="linear-gradient(135deg, #059669, #34d399)"
          strokeColor="#34d399"
          sparkline={sparkPaid}
          badge={{ label: isAr ? 'مكتمل' : 'Paid', positive: true }}
          infoTitle={isAr ? 'الإيرادات المدفوعة' : 'Paid Revenue'}
          infoDesc={isAr ? 'الإيرادات التي تم تحصيلها فعلياً. الأهم لقياس السيولة.' : 'Revenue actually collected. The core liquidity metric.'}
        />
        <KpiCard
          title={isAr ? 'مدفوعات معلقة' : 'Pending Payments'}
          value={`${pendingRevenue.toLocaleString()} MAD`}
          sub={isAr ? `${pendingCount} طلبات معلقة` : `${pendingCount} orders pending`}
          icon={<Clock size={16} />}
          accent="linear-gradient(135deg, #d97706, #fbbf24)"
          strokeColor="#fbbf24"
          sparkline={sparkPending}
          badge={{ label: `${pendingCount} COD` }}
          infoTitle={isAr ? 'المدفوعات المعلقة' : 'Pending Payments'}
          infoDesc={isAr ? 'قيمة الطلبات التي لم يتم تحصيلها بعد — خاصة مهمة لمتاجر الدفع عند الاستلام.' : 'Value of orders not yet collected — critical for COD stores.'}
        />
        <KpiCard
          title={isAr ? 'المبالغ المسترجعة' : 'Refunded Amount'}
          value={`${refunded.toLocaleString()} MAD`}
          sub={isAr ? `${refundedCount} طلبات مسترجعة` : `${refundedCount} orders refunded`}
          icon={<RotateCcw size={16} />}
          accent="linear-gradient(135deg, #dc2626, #f87171)"
          strokeColor="#f87171"
          sparkline={sparkRefund}
          badge={{ label: isAr ? 'مسترجع' : 'Refunded', positive: false }}
          infoTitle={isAr ? 'المبالغ المسترجعة' : 'Refunded Amount'}
          infoDesc={isAr ? 'إجمالي المبالغ المعادة للعملاء. ارتفاعه يشير لمشاكل جودة أو توصيل.' : 'Total refunded to customers. Rising values signal quality/delivery issues.'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title={t('dashboard.totalCustomers')}
          value={customers.length.toLocaleString()}
          sub={t('dashboard.fromLiveData')}
          icon={<Users size={16} />}
          accent="linear-gradient(135deg, #0284c7, #38bdf8)"
          strokeColor="#38bdf8"
          sparkline={(() => { const n = customers.length; return [n*0.7, n*0.8, n*0.9, n*0.85, n*0.95, n, n*0.98]; })()}
          badge={{ label: isAr ? 'نشط' : 'Active', positive: true }}
          infoTitle={isAr ? 'إجمالي العملاء' : 'Total Customers'}
          infoDesc={isAr ? 'عدد العملاء المسجلين. يقارن مع العملاء الجدد لقياس النمو.' : 'Registered customers count. Compare with new customers to gauge growth.'}
        />
        <KpiCard
          title={t('dashboard.totalProducts')}
          value={products.length.toLocaleString()}
          sub={isAr ? `${outOfStock} غير متوفر` : `${outOfStock} out of stock`}
          icon={<Package size={16} />}
          accent="linear-gradient(135deg, #7c3aed, #c084fc)"
          strokeColor="#c084fc"
          sparkline={sparkProducts}
          badge={{ label: isAr ? 'الكتالوج' : 'Catalog' }}
          infoTitle={isAr ? 'إجمالي المنتجات' : 'Total Products'}
          infoDesc={isAr ? 'حجم الكتالوج. راقب المنتجات غير المتوفرة لتجنب ضياع المبيعات.' : 'Catalog size. Watch out-of-stock to avoid lost sales.'}
        />
        <KpiCard
          title={isAr ? 'مخزون منخفض' : 'Low Stock'}
          value={lowStock.toLocaleString()}
          sub={isAr ? 'يحتاج إعادة تموين' : 'Needs restocking'}
          icon={<AlertTriangle size={16} />}
          accent="linear-gradient(135deg, #ea580c, #ff8c00)"
          strokeColor="#ff8c00"
          sparkline={sparkProducts}
          badge={{ label: isAr ? 'تنبيه' : 'Alert', positive: false }}
          infoTitle={isAr ? 'مخزون منخفض' : 'Low Stock'}
          infoDesc={isAr ? 'منتجات قاربت على النفاد. أعد التموين بسرعة لتفادي توقف المبيعات.' : 'Products close to running out. Restock quickly to avoid lost sales.'}
        />
        <KpiCard
          title={isAr ? 'نفد المخزون' : 'Out of Stock'}
          value={outOfStock.toLocaleString()}
          sub={isAr ? 'غير متاح حالياً' : 'Currently unavailable'}
          icon={<PackageX size={16} />}
          accent="linear-gradient(135deg, #991b1b, #ef4444)"
          strokeColor="#ef4444"
          sparkline={sparkProducts.map(v => Math.max(0, 8 - v % 8))}
          badge={{ label: isAr ? 'حرِج' : 'Critical', positive: false }}
          infoTitle={isAr ? 'نفد المخزون' : 'Out of Stock'}
          infoDesc={isAr ? 'منتجات بصفر مخزون — مبيعات ضائعة مباشرة. أعطها أولوية.' : 'Zero-stock products — direct lost sales. Prioritize restocking.'}
        />
      </div>
    </div>
  );
};

export default KpiGrid;
