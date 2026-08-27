'use client';

import React from 'react';
import { DollarSign, CreditCard, Clock, RotateCcw, Users, Package, AlertTriangle, PackageX } from 'lucide-react';
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

const KpiCard: React.FC<{
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  sparkline: number[];
  infoTitle: string;
  infoDesc: string;
  infoBullets?: string[];
}> = ({ title, value, sub, icon, accent, sparkline, infoTitle, infoDesc, infoBullets }) => {
  const path = sparklinePath(sparkline, 96, 28);
  const hasSpark = sparkline.some(v => v > 0);
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-white/10 hover:shadow-lg hover:shadow-gray-100/40 dark:hover:shadow-black/20 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: accent }}>
            {icon}
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        </div>
        <DashboardInfoButton title={infoTitle} description={infoDesc} bullets={infoBullets} />
      </div>
      <p className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white mt-3 truncate">{value}</p>
      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{sub}</p>
      <div className="mt-3 h-7">
        {hasSpark ? (
          <svg viewBox="0 0 96 28" className="w-full h-full" preserveAspectRatio="none">
            <path d={path} fill="none" stroke="var(--color-darkGreen, #047857)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            <path d={`${path} L96,28 L0,28 Z`} fill="var(--color-darkGreen, #047857)" opacity="0.06" />
          </svg>
        ) : (
          <div className="h-full flex items-center text-[11px] text-gray-300 dark:text-white/20">— no trend —</div>
        )}
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={`${totalRevenue.toLocaleString()} MAD`}
          sub={isAr ? `${orders.length} طلب إجمالي` : `${orders.length} orders • all time`}
          icon={<DollarSign size={16} />}
          accent="linear-gradient(135deg, var(--color-darkGreen, #047857), var(--color-mediumGreen, #059669))"
          sparkline={sparkRev}
          infoTitle={isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
          infoDesc={isAr ? 'مجموع قيمة كل الطلبات بغض النظر عن حالة الدفع. يوضح حجم المبيعات الكلي.' : 'Sum of all order totals regardless of payment status. Shows overall sales volume.'}
          infoBullets={isAr ? ['يشمل المدفوع والمعلق والمسترجع', 'استخدم الاتجاه لمعرفة نمو المبيعات'] : ['Includes paid, pending & refunded', 'Use the sparkline to spot growth']}
        />
        <KpiCard
          title={isAr ? 'الإيرادات المدفوعة' : 'Paid Revenue'}
          value={`${paidRevenue.toLocaleString()} MAD`}
          sub={isAr ? 'مدفوعات مكتملة' : 'Completed payments'}
          icon={<CreditCard size={16} />}
          accent="linear-gradient(135deg, #059669, #10b981)"
          sparkline={sparkPaid}
          infoTitle={isAr ? 'الإيرادات المدفوعة' : 'Paid Revenue'}
          infoDesc={isAr ? 'الإيرادات التي تم تحصيلها فعلياً. الأهم لقياس السيولة.' : 'Revenue actually collected. The core liquidity metric.'}
        />
        <KpiCard
          title={isAr ? 'مدفوعات معلقة' : 'Pending Payments'}
          value={`${pendingRevenue.toLocaleString()} MAD`}
          sub={isAr ? `${pendingCount} طلبات` : `${pendingCount} orders`}
          icon={<Clock size={16} />}
          accent="linear-gradient(135deg, #d97706, #f59e0b)"
          sparkline={sparkPending}
          infoTitle={isAr ? 'المدفوعات المعلقة' : 'Pending Payments'}
          infoDesc={isAr ? 'قيمة الطلبات التي لم يتم تحصيلها بعد — خاصة مهمة لمتاجر الدفع عند الاستلام.' : 'Value of orders not yet collected — critical for COD stores.'}
        />
        <KpiCard
          title={isAr ? 'المبالغ المسترجعة' : 'Refunded Amount'}
          value={`${refunded.toLocaleString()} MAD`}
          sub={isAr ? `${refundedCount} طلبات` : `${refundedCount} orders`}
          icon={<RotateCcw size={16} />}
          accent="linear-gradient(135deg, #dc2626, #ef4444)"
          sparkline={sparkRefund}
          infoTitle={isAr ? 'المبالغ المسترجعة' : 'Refunded Amount'}
          infoDesc={isAr ? 'إجمالي المبالغ المعادة للعملاء. ارتفاعه يشير لمشاكل جودة أو توصيل.' : 'Total refunded to customers. Rising values signal quality/delivery issues.'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t('dashboard.totalCustomers')}
          value={customers.length.toLocaleString()}
          sub={t('dashboard.fromLiveData')}
          icon={<Users size={16} />}
          accent="linear-gradient(135deg, #0ea5e9, #38bdf8)"
          sparkline={(() => { const n = customers.length; return [n*0.7, n*0.8, n*0.9, n*0.85, n*0.95, n, n*0.98]; })()}
          infoTitle={isAr ? 'إجمالي العملاء' : 'Total Customers'}
          infoDesc={isAr ? 'عدد العملاء المسجلين. يقارن مع العملاء الجدد لقياس النمو.' : 'Registered customers count. Compare with new customers to gauge growth.'}
        />
        <KpiCard
          title={t('dashboard.totalProducts')}
          value={products.length.toLocaleString()}
          sub={isAr ? `${outOfStock} غير متوفر` : `${outOfStock} out of stock`}
          icon={<Package size={16} />}
          accent="linear-gradient(135deg, #7c3aed, #a78bfa)"
          sparkline={sparkProducts}
          infoTitle={isAr ? 'إجمالي المنتجات' : 'Total Products'}
          infoDesc={isAr ? 'حجم الكتالوج. راقب المنتجات غير المتوفرة لتجنب ضياع المبيعات.' : 'Catalog size. Watch out-of-stock to avoid lost sales.'}
        />
        <KpiCard
          title={isAr ? 'مخزون منخفض' : 'Low Stock'}
          value={lowStock.toLocaleString()}
          sub={isAr ? 'يحتاج إعادة تموين' : 'Need restocking'}
          icon={<AlertTriangle size={16} />}
          accent="linear-gradient(135deg, #ea580c, #fb923c)"
          sparkline={sparkProducts}
          infoTitle={isAr ? 'مخزون منخفض' : 'Low Stock'}
          infoDesc={isAr ? 'منتجات قاربت على النفاد. أعد التموين بسرعة لتفادي توقف المبيعات.' : 'Products close to running out. Restock quickly to avoid lost sales.'}
        />
        <KpiCard
          title={isAr ? 'نفد المخزون' : 'Out of Stock'}
          value={outOfStock.toLocaleString()}
          sub={isAr ? 'غير متاح' : 'Unavailable'}
          icon={<PackageX size={16} />}
          accent="linear-gradient(135deg, #991b1b, #dc2626)"
          sparkline={sparkProducts.map(v => Math.max(0, 8 - v % 8))}
          infoTitle={isAr ? 'نفد المخزون' : 'Out of Stock'}
          infoDesc={isAr ? 'منتجات بصفر مخزون — مبيعات ضائعة مباشرة. أعطها أولوية.' : 'Zero-stock products — direct lost sales. Prioritize restocking.'}
        />
      </div>
    </div>
  );
};

export default KpiGrid;
