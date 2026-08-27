'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Phone, ExternalLink, MapPin, Truck, Calendar, Clock,
  Package, CheckCircle2, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';
import type { Order } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';

interface TimelineOrderMeta {
  order: Order;
  deliverySpeed: string;
  deliverySpeedAr: string;
  expectedDate: string;
  progress: number;
  badgeBg: string;
  isUrgent?: boolean;
}

interface Props {
  data: TimelineOrderMeta | null;
  onClose: () => void;
}

const OrderTimelineModal: React.FC<Props> = ({ data, onClose }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { setCurrentPage } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || !mounted) return null;

  const { order, deliverySpeed, deliverySpeedAr, expectedDate, progress, badgeBg, isUrgent } = data;

  const handleNavigateToOrder = () => {
    setCurrentPage('orders');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${badgeBg}`}
            >
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  #{order.orderNumber || order.id.slice(0, 8)}
                </h3>
                {isUrgent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse shadow-xs">
                    {isAr ? 'تنبيه وصول قريباً' : 'Arriving Soon'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? `توصيل: ${deliverySpeedAr}` : `Delivery: ${deliverySpeed}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Delivery Progress Bar */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--color-darkGreen,#047857)]" />
              {isAr ? 'نسبة إنجاز التوصيل' : 'Delivery Progress'}
            </span>
            <span className="text-[var(--color-darkGreen,#047857)] dark:text-emerald-400 font-extrabold text-sm">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${badgeBg}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400 pt-1">
            <span>{isAr ? 'تاريخ الطلب' : 'Ordered'}: {new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {isAr ? 'موعد الوصول المتوقع' : 'Expected'}: {expectedDate}
            </span>
          </div>
        </div>

        {/* Customer Information & Quick Call Action */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles size={12} className="text-[var(--color-darkGreen,#047857)]" />
            {isAr ? 'معلومات الزبون والاتصال' : 'Customer & Contact'}
          </h4>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {order.customerName || order.shippingAddress?.name || 'Customer'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <MapPin size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{order.shippingAddress?.city || 'Marrakech'}, Morocco</span>
              </div>
            </div>

            {order.customerPhone || order.shippingAddress?.phone ? (
              <a
                href={`tel:${order.customerPhone || order.shippingAddress?.phone}`}
                className="px-3.5 py-2 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95"
              >
                <Phone size={14} />
                {isAr ? 'اتصل بالزبون' : 'Call Customer'}
              </a>
            ) : (
              <span className="text-xs text-gray-400">{isAr ? 'لا يوجد رقم' : 'No Phone'}</span>
            )}
          </div>
        </div>

        {/* Order Items & Total Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>{isAr ? 'ملخص الطلبية' : 'Order Items'}</span>
            <span className="text-gray-900 dark:text-white font-extrabold">{order.total?.toLocaleString() || 0} MAD</span>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Package size={14} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 font-semibold shrink-0">
                    x{item.quantity} • {item.price} MAD
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-400 text-center italic">{isAr ? 'تفاصيل العناصر متوفرة في الصفحة' : 'Item list available'}</div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>

          <button
            type="button"
            onClick={handleNavigateToOrder}
            className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, var(--color-darkGreen, #047857), var(--color-mediumGreen, #059669))' }}
          >
            {isAr ? 'عرض تفاصيل الطلب الكاملة' : 'More Info & Order Details'}
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderTimelineModal;
