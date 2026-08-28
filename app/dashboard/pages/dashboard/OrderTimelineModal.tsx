'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Phone, MapPin, Truck, Clock, Package, CheckCircle2, AlertTriangle,
  Sparkles, ChevronRight, RefreshCw, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import { calculateOrderSla, isValidStatusTransition } from './timeline/deliverySlaService';
import { normalizeHistory } from './timeline/timelineController';

interface TimelineOrderMeta {
  order: Order;
  orderStatus?: OrderStatus;
  deliverySpeed?: string;
  deliverySpeedAr?: string;
  expectedDate?: string;
  progress?: number;
  badgeBg?: string;
}

interface Props {
  data: TimelineOrderMeta | null;
  onClose: () => void;
}

const ORDER_STATUS_STEPS: { id: OrderStatus; labelEn: string; labelAr: string }[] = [
  { id: 'pending', labelEn: 'Pending', labelAr: 'معلق' },
  { id: 'confirmed', labelEn: 'Confirmed', labelAr: 'مؤكد' },
  { id: 'processing', labelEn: 'Processing', labelAr: 'قيد المعالجة' },
  { id: 'shipped', labelEn: 'Shipping', labelAr: 'في الطريق' },
  { id: 'delivered', labelEn: 'Delivered', labelAr: 'تم التسليم' },
];

const OrderTimelineModal: React.FC<Props> = ({ data, onClose }) => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { setCurrentPage, updateOrderStatus, orders } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pendingSkippedStatuses, setPendingSkippedStatuses] = useState<OrderStatus[] | null>(null);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<OrderStatus | null>(null);
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, onClose]);

  if (!data || !mounted) return null;

  // Use live order from store (updates after status change)
  const liveOrder = orders.find(o => o.id === data.order.id) || data.order;
  const order = liveOrder;
  const currentStatus = order.orderStatus || 'pending';
  const sla = calculateOrderSla(order, new Date(), isAr);
  // Timeline for modal — same source as Orders page View Details (order_timeline), fallback to Real-Time Controller derived history
  const displayTimeline = (() => {
    const raw = (order as any).timeline;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    try {
      const hist = normalizeHistory(order as any);
      return hist.map(n => ({ status: n.status, timestamp: new Date(n.timestampMs).toISOString(), note: (n as any).note || null }));
    } catch {
      return [];
    }
  })();

  const handleNavigateToOrder = () => {
    setCurrentPage('orders');
    onClose();
  };

  const ORDER_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  const handleStatusChange = async (targetStatus: OrderStatus) => {
    setStatusError(null);
    if (targetStatus === currentStatus) return;

    // Calculate skipped statuses (statuses between current and target)
    const curIdx = ORDER_FLOW.indexOf(currentStatus as OrderStatus);
    const tgtIdx = ORDER_FLOW.indexOf(targetStatus);

    // If target is a future status (not just one step ahead), calculate skipped
    if (tgtIdx > curIdx + 1) {
      const skipped = ORDER_FLOW.slice(curIdx + 1, tgtIdx); // all between current and target (exclusive)
      setPendingSkippedStatuses(skipped);
      setPendingTargetStatus(targetStatus);
      return; // wait for confirmation
    }

    // Single-step valid transition or backward transition
    if (!isValidStatusTransition(currentStatus, targetStatus)) {
      setStatusError(
        isAr
          ? `عذراً! لا يمكن الانتقال المباشر من [${currentStatus}] إلى [${targetStatus}]. يرجى تتبع تسلسل مراحل الطلب.`
          : `Invalid transition from [${currentStatus}] to [${targetStatus}]. Please follow lifecycle steps.`
      );
      return;
    }

    setIsUpdatingStatus(true);
    try {
      if (updateOrderStatus) {
        await updateOrderStatus(order.id, targetStatus);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmSkipStatuses = async () => {
    if (!pendingSkippedStatuses || !pendingTargetStatus) return;
    const allStatuses = [...pendingSkippedStatuses, pendingTargetStatus];
    setPendingSkippedStatuses(null);
    setPendingTargetStatus(null);
    setIsUpdatingStatus(true);
    try {
      for (const status of allStatuses) {
        if (updateOrderStatus) {
          await updateOrderStatus(order.id, status);
        }
      }
    } catch (err) {
      console.error('Failed to update order statuses:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelSkipStatuses = () => {
    setPendingSkippedStatuses(null);
    setPendingTargetStatus(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
              currentStatus === 'delivered' ? 'bg-gray-500' : currentStatus === 'cancelled' ? 'bg-red-500' : currentStatus === 'shipped' ? 'bg-sky-500' : currentStatus === 'processing' ? 'bg-purple-600' : currentStatus === 'confirmed' ? 'bg-blue-600' : 'bg-amber-500'
            }`}>
              {currentStatus === 'delivered' && <CheckCircle2 size={22} />}
              {currentStatus === 'cancelled' && <XCircle size={22} />}
              {currentStatus === 'shipped' && <Truck size={22} className="animate-bounce" />}
              {currentStatus === 'processing' && <RefreshCw size={22} className="animate-spin" />}
              {currentStatus === 'confirmed' && <CheckCircle2 size={22} />}
              {currentStatus === 'pending' && <Clock size={22} className="animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  #{order.orderNumber || order.id.slice(0, 8)}
                </h3>
                {sla.state === 'overdue' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                    {isAr ? 'تأخير في التسليم (Overdue)' : 'Overdue Delivery'}
                  </span>
                )}
                {sla.state === 'critical' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                    {isAr ? 'تنبيه حرج (10%)' : 'Critical SLA'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isAr ? `وسيلة التوصيل: ${sla.deliveryMethod}` : `Shipping Method: ${sla.deliveryMethod}`}
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

        {/* Status Transition Control Pipeline */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              {isAr ? 'التحكم المباشر في حالة الطلب' : 'Order Status Control'}
            </span>
            {isUpdatingStatus && (
              <span className="text-xs text-emerald-600 animate-pulse flex items-center gap-1">
                <RefreshCw size={12} className="animate-spin" /> {isAr ? 'جاري التحديث...' : 'Updating...'}
              </span>
            )}
          </div>

          {/* Compact Step Progression */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {ORDER_STATUS_STEPS.map(step => {
              const orderFlow: OrderStatus[] = ['pending','confirmed','processing','shipped','delivered'];
              const curIdx = orderFlow.indexOf(currentStatus as OrderStatus);
              const stepIdx = orderFlow.indexOf(step.id);
              const isActive = currentStatus === step.id;
              const isPast = curIdx > stepIdx && stepIdx !== -1 && curIdx !== -1;

              return (
                <button
                  key={step.id}
                  onClick={() => handleStatusChange(step.id)}
                  disabled={isUpdatingStatus}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1 text-center cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                      : isPast
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100'
                      : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-300'
                  }`}
                >
                  <span className="truncate">{isAr ? step.labelAr : step.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Cancel Option */}
          {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdatingStatus}
                className="text-[11px] font-extrabold text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <XCircle size={12} />
                {isAr ? 'إلغاء الطلب (Cancel Order)' : 'Cancel Order'}
              </button>
            </div>
          )}

          {/* Validation Error Message */}
          {statusError && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{statusError}</span>
            </div>
          )}

          {/* Skip Confirmation */}
          {pendingSkippedStatuses && pendingTargetStatus && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 space-y-2.5">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? `سيتم تخطي المراحل التالية وتحديثها تلقائياً:`
                    : `The following stages will be skipped and auto-updated:`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {pendingSkippedStatuses.map((s) => {
                  const step = ORDER_STATUS_STEPS.find((st) => st.id === s);
                  return (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100 border border-amber-300 dark:border-amber-700">
                      {isAr ? step?.labelAr : step?.labelEn}
                    </span>
                  );
                })}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
                  → {isAr ? ORDER_STATUS_STEPS.find((st) => st.id === pendingTargetStatus)?.labelAr : ORDER_STATUS_STEPS.find((st) => st.id === pendingTargetStatus)?.labelEn}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={confirmSkipStatuses}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center gap-1"
                >
                  {isUpdatingStatus ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}
                  {isAr ? 'تأكيد وتنفيذ' : 'Confirm & Execute'}
                </button>
                <button
                  onClick={cancelSkipStatuses}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Timestamp SLA Metrics (if Shipping or Delivered) */}
        {(currentStatus === 'shipped' || currentStatus === 'delivered') && (
          <div className="bg-sky-50/60 dark:bg-sky-950/30 rounded-2xl p-4 border border-sky-100 dark:border-sky-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                <Truck size={14} className="text-sky-600 dark:text-sky-400" />
                {isAr ? 'عدّاد التوصيل المباشر (SLA Timer)' : 'Real-time SLA Countdown'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                sla.state === 'overdue' ? 'bg-rose-600 text-white animate-pulse' :
                sla.state === 'critical' ? 'bg-red-600 text-white animate-pulse' :
                sla.state === 'warning' ? 'bg-amber-500 text-white' :
                sla.state === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white'
              }`}>
                {sla.remainingFormatted}
              </span>
            </div>

            {currentStatus === 'shipped' && (
              <div className="w-full bg-sky-200 dark:bg-sky-900/50 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sla.state === 'overdue' ? 'bg-rose-600' : sla.state === 'critical' ? 'bg-red-600' : sla.state === 'warning' ? 'bg-amber-500' : 'bg-sky-600'
                  }`}
                  style={{ width: `${sla.slaPercent}%` }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-sky-800 dark:text-sky-300 pt-1">
              <div>
                <span className="opacity-75">{isAr ? 'تاريخ الشحن' : 'Shipped'}: </span>
                <span>{sla.shippedAt ? new Date(sla.shippedAt).toLocaleString() : '--'}</span>
              </div>
              <div className="text-right">
                <span className="opacity-75">{isAr ? 'الموعد النهائي' : 'Deadline'}: </span>
                <span>{sla.deadline ? new Date(sla.deadline).toLocaleString() : '--'}</span>
              </div>
            </div>

            {sla.deliveredDurationFormatted && (
              <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 pt-1 border-t border-sky-200/60 dark:border-sky-800/40 flex items-center justify-between">
                <span>{isAr ? 'مدة التوصيل الفعلية:' : 'Total Delivery Time:'} {sla.deliveredDurationFormatted}</span>
                {sla.deliveredEarlyFormatted && (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ {isAr ? `مبكر بـ ${sla.deliveredEarlyFormatted}` : `${sla.deliveredEarlyFormatted} early`}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Timeline — same design as Orders → View Details — collapsed by default */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setTimelineExpanded(v => !v)}
            className="w-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
            aria-expanded={timelineExpanded}
          >
            <Clock size={12} className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            <span>{isAr ? 'سجل حالة الطلب' : 'Order Timeline'}</span>
            {displayTimeline.length ? (
              <span className="ml-2 text-[10px] font-normal bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-white/10 normal-case">
                {displayTimeline.length} {isAr ? 'حدث' : 'events'}
              </span>
            ) : null}
            <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold normal-case">
              <span className="hidden sm:inline">{timelineExpanded ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'عرض' : 'Show')}</span>
              <span className={`w-6 h-6 rounded-full border bg-white dark:bg-white/10 flex items-center justify-center transition-transform ${timelineExpanded ? 'rotate-180' : ''}`}>
                <ChevronRight size={12} className="rotate-90" />
              </span>
            </span>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${timelineExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              {displayTimeline.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  {isAr ? 'لا يوجد سجل بعد' : 'No timeline events yet'}
                </div>
              ) : (
                <div className="relative bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                  {displayTimeline.map((event: any, index: number) => {
                const isLast = index === displayTimeline.length - 1;
                const iconMap: Record<string, React.ReactNode> = {
                  pending: <Clock size={12} />,
                  confirmed: <CheckCircle2 size={12} />,
                  processing: <Package size={12} />,
                  shipped: <Truck size={12} />,
                  delivered: <CheckCircle2 size={12} />,
                  cancelled: <XCircle size={12} />,
                  refunded: <RefreshCw size={12} />,
                };
                const colorMap: Record<string, string> = {
                  pending: 'bg-amber-100 text-amber-700 border-amber-200',
                  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
                  processing: 'bg-purple-100 text-purple-700 border-purple-200',
                  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                  cancelled: 'bg-red-100 text-red-700 border-red-200',
                  refunded: 'bg-gray-100 text-gray-700 border-gray-200',
                };
                return (
                  <div key={index} className="flex items-start gap-3 relative">
                    {!isLast && <div className="absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-8px)] bg-gray-200 dark:bg-white/10" />}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${isLast ? 'bg-[#0a2c23] text-white border-[#0a2c23] shadow-md' : colorMap[event.status] || 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                      {iconMap[event.status] || <Clock size={12} />}
                    </div>
                    <div className="pb-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{event.status}</p>
                        {isLast && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#0a2c23] text-white rounded-md">Latest</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(event.timestamp).toLocaleDateString(isAr ? 'ar-MA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {event.note && (
                        <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                          <p className="text-xs text-gray-600 dark:text-gray-300">{event.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Customer Information & Quick Call Action */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-600" />
            {isAr ? 'معلومات الزبون والاتصال' : 'Customer & Contact'}
          </h4>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {order.customerName || order.shippingAddress?.name || 'Customer'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <MapPin size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{order.shippingAddress?.city || 'Casablanca'}, Morocco</span>
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

          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Package size={14} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item.productName || item.name || 'Product'}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 font-semibold shrink-0">
                    x{item.quantity} • {item.total ?? item.price * item.quantity} MAD
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
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>

          <button
            type="button"
            onClick={handleNavigateToOrder}
            className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, var(--color-darkGreen, #047857), var(--color-mediumGreen, #059669))' }}
          >
            {isAr ? 'عرض تفاصيل الطلب الكاملة' : 'More Info'}
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderTimelineModal;
