'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { WHATSAPP_LINK } from '@/app/constants';
import { fetchOrderByNumber, OrderTrackingData } from '@/lib/order-utils';
import {
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  ShoppingBag,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Tag,
  MessageCircle,
  Home,
  User,
  FileText,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Order Placed', labelAr: 'تم استقبال الطلب', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', labelAr: 'تم التأكيد', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  processing: { label: 'Processing', labelAr: 'جاري التحضير', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Package },
  shipped: { label: 'Shipped', labelAr: 'مع شركة الشحن', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  delivered: { label: 'Delivered', labelAr: 'تم التسليم', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', labelAr: 'ملغي', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

type StatusKey = keyof typeof STATUS_CONFIG;

const STATUS_FLOW: StatusKey[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function StatusBadge({ status }: { status: OrderTrackingData['orderStatus'] }) {
  const config = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.cancelled;
  const Icon = config.icon;
  return (
    <div className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center gap-2 ${config.color}`}>
      <Icon size={16} />
      {config.label}
    </div>
  );
}

function PaymentBadge({ status }: { status: OrderTrackingData['paymentStatus'] }) {
  if (status === 'paid') {
    return (
      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-1">
        <CheckCircle2 size={14} />
        Paid
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium flex items-center gap-1">
      <Clock size={14} />
      Payment pending
    </span>
  );
}

export default function TrackOrderClient() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const paymentMethodLabels: Record<string, string> = {
    cash_on_delivery: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery',
    credit_card: isAr ? 'بطاقة ائتمان' : 'Credit Card',
    bank_transfer: isAr ? 'تحويل بنكي' : 'Bank Transfer',
    mobile_payment: isAr ? 'دفع جوال' : 'Mobile Payment',
  };

  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError(isAr ? 'الرجاء إدخال رقم الطلب.' : 'Please enter your order number.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await fetchOrderByNumber(trimmed);
      if (data) {
        setOrder(data);
      } else {
        setError(isAr ? 'لم يتم العثور على الطلب. يرجى التحقق وإعادة المحاولة.' : 'No order found with this number. Please check and try again.');
      }
    } catch {
      setError(isAr ? 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' : 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNumber(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="bg-stone-50" dir={isAr ? 'rtl' : 'ltr'}>
      <main className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {isAr ? 'تتبع طلبك' : 'Track Your Order'}
            </h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              {isAr
                ? 'أدخل رقم الطلب لرؤية أحدث الحالة وتحديثات التسليم.'
                : 'Enter your order number to see the latest status and delivery updates.'}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={orderNumber}
                  onChange={handleInputChange}
                  placeholder={isAr ? 'مثال: SDF-20240115-ABCDEF' : 'e.g. SDF-20240115-ABCDEF'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#cda552] focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-400"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#0b4a28] to-[#166c3b] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[130px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isAr ? 'جارٍ البحث…' : 'Searching…'}</span>
                  </>
                ) : (
                  isAr ? 'تتبع الطلب' : 'Track Order'
                )}
              </button>
            </form>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6 animate-fade-up">
              {/* Banner Section with Order Number Badge */}
              <div
                className="relative py-10 sm:py-12 px-6 text-center text-white overflow-hidden rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 60%, #0d3428 100%)',
                  borderBottom: '1px solid rgba(205, 165, 82, 0.25)',
                }}
              >
                <div className="max-w-2xl mx-auto relative z-10 space-y-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
                    style={{
                      background: 'rgba(205, 165, 82, 0.18)',
                      border: '2px solid #cda552',
                    }}
                  >
                    <Package className="w-10 h-10" style={{ color: '#cda552' }} />
                  </div>

                  <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 text-amber-300 border border-amber-300/30">
                    {isAr ? 'تفاصيل الطلب' : 'Order Details'}
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#f7ebd0' }}>
                    {isAr ? 'مرحباً بك في صفحة تتبع الطلب' : 'Your Order Tracking'}
                  </h1>

                  {/* Order Number Badge */}
                  <div
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-md mt-2"
                    style={{
                      background: 'rgba(205, 165, 82, 0.1)',
                      borderColor: 'rgba(205, 165, 82, 0.3)',
                    }}
                  >
                    <Package className="w-5 h-5 text-amber-300" />
                    <span className="text-xs text-amber-200">{isAr ? 'رقم الطلب:' : 'Order Number:'}</span>
                    <span className="text-base font-black tracking-wider text-white">
                      {order.orderNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{isAr ? 'رقم الطلب' : 'Order'}</p>
                    <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <StatusBadge status={order.orderStatus} />
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                </div>

                {/* Payment method + tracking info row */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  {order.paymentMethod && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard size={14} className="text-gray-400" />
                      <span className="text-gray-500">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                      <span className="text-gray-700 font-medium">
                        {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </div>
                  )}
                  {order.deliveryMethod && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck size={14} className="text-gray-400" />
                      <span className="text-gray-500">{isAr ? 'طريقة التوصيل:' : 'Delivery Method:'}</span>
                      <span className="text-gray-700 font-medium">{order.deliveryMethod}</span>
                    </div>
                  )}
                  {order.trackingNumber && order.shippingProvider && (
                    <div className="sm:col-span-2 flex items-center gap-2 text-sm">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-gray-500">{isAr ? 'رقم التتبع:' : 'Tracking Number:'}</span>
                      <span className="text-gray-700 font-medium">{order.trackingNumber}</span>
                      <span className="text-gray-400">—</span>
                      <span className="text-gray-700 font-medium">{order.shippingProvider}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Progress Tracker */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Clock size={16} />
                  {isAr ? 'تقدم الطلب' : 'Order Progress'}
                </h3>
                <div className="relative pt-2">
                  <div className="flex justify-between items-center relative z-10">
                    {STATUS_FLOW.map((statusKey, index) => {
                      const config = STATUS_CONFIG[statusKey];
                      const currentStatusIndex = STATUS_FLOW.indexOf(order.orderStatus as StatusKey);
                      const isCompleted = index <= currentStatusIndex;

                      return (
                        <div key={statusKey} className="flex flex-col items-center gap-2 text-center flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              isCompleted
                                ? 'bg-[#166c3b] border-[#166c3b] text-amber-300'
                                : 'bg-stone-100 border-stone-300 text-stone-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-amber-300" /> : index + 1}
                          </div>
                          <span
                            className={`text-[11px] font-bold ${
                              isCompleted ? 'text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {isAr ? config.labelAr : config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Timeline (detailed) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Clock size={16} />
                  {isAr ? 'الجدول الزمني للطلب' : 'Order Timeline'}
                </h3>
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                  {order.timeline.map((event, index) => {
                    const isLast = index === order.timeline.length - 1;
                    const statusKey = event.status as StatusKey;
                    const isCurrent = event.status === order.orderStatus;
                    const currentStatusIndex = order.timeline.findIndex((e) => e.status === order.orderStatus);
                    const isCompleted = currentStatusIndex > index;
                    const config = STATUS_CONFIG[statusKey] || {
                      label: event.status,
                      labelAr: event.status,
                      color: 'text-gray-600',
                      icon: Clock,
                    };

                    return (
                      <div key={index} className="relative">
                        {/* Timeline node */}
                        <div className="absolute -left-[25px] top-0.5">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-[#166c3b] flex items-center justify-center text-white">
                              <config.icon size={16} />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-8 h-8 rounded-full bg-[#cda552] flex items-center justify-center text-white ring-2 ring-[#cda552]/30">
                              <config.icon size={16} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-gray-400">
                              <config.icon size={14} />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span
                              className={`text-sm font-medium ${
                                isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {isAr ? config.labelAr : config.label || event.status}
                            </span>
                            {event.note && (
                              <p className="text-xs text-gray-400 mt-0.5">{event.note}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleString(isAr ? 'ar-MA' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Connecting line to next step */}
                        {!isLast && (
                          <div className="absolute -left-[3px] top-8 bottom-6 w-0.5 bg-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items + Shipping Info (left) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Items */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <ShoppingBag size={16} />
                      {isAr ? `المنتجات (${order.items.length})` : `Items (${order.items.length})`}
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                          {item.image ? (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              img
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">
                                {item.quantity} × {item.unitPrice?.toFixed(2) || '0.00'} {isAr ? 'د.م' : 'MAD'}
                              </span>
                              {item.productId && (
                                <Link
                                  href={`/store/${item.productId}`}
                                  className="text-xs text-[#0b4a28] hover:underline font-medium"
                                >
                                  {isAr ? 'عرض المنتج' : 'View Product'}
                                </Link>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {Number(item.total).toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin size={16} />
                      {isAr ? 'عنوان التوصيل' : 'Shipping Address'}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        {order.shippingAddress.name}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {order.shippingAddress.phone || order.customerPhone}
                      </p>
                      {order.shippingAddress.email && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          {order.shippingAddress.email}
                        </p>
                      )}
                      <p className="text-gray-600">
                        {order.shippingAddress.address}
                        <br />
                        {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary Totals (right) */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CreditCard size={16} />
                      {isAr ? 'ملخص الطلب' : 'Order Summary'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span className="text-gray-900 font-medium">{Number(order.subtotal).toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                      </div>

                      {order.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Tag size={12} className="text-amber-500" />
                            {isAr ? 'الخصم' : 'Discount'}
                          </span>
                          <span className="text-red-500 font-medium">-{Number(order.discount).toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-500">{isAr ? 'الشحن' : 'Shipping'}</span>
                        <span className="text-gray-900 font-medium">
                          {order.shippingCost === 0
                            ? isAr ? 'مجاني 🎉' : 'FREE 🎉'
                            : `${Number(order.shippingCost).toFixed(2)} ${isAr ? 'د.م' : 'MAD'}`}
                        </span>
                      </div>

                      {order.couponCode && (
                        <div className="flex justify-between bg-amber-50 px-2 py-1 rounded">
                          <span className="text-amber-700 text-xs flex items-center gap-1">
                            <Tag size={12} />
                            {isAr ? 'كوبون مطبق' : 'Coupon Applied'}
                          </span>
                          <span className="text-amber-700 text-xs font-bold">{order.couponCode}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                        <span className="text-gray-700">{isAr ? 'الإجمالي' : 'Total'}</span>
                        <span className="text-lg" style={{ color: '#0b2e22' }}>
                          {Number(order.total).toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes (if present) */}
                  {order.notes && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        {isAr ? 'ملاحظات' : 'Notes'}
                      </h3>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Support + Action Buttons */}
              <div className="space-y-4 pt-2">
                {/* WhatsApp Trace Button */}
                <a
                  href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                    (isAr
                      ? `مرحباً دار صودفا 🌿، أريد الاستفسار عن طلبي رقم: *${order.orderNumber}*\nالاسم: ${order.customerName}\nالمجموع: ${Number(order.total).toFixed(2)} د.م`
                      : `Hello SODFA Store 🌿, I want to trace my order: *${order.orderNumber}*\nName: ${order.customerName}\nTotal: ${Number(order.total).toFixed(2)} MAD`)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{isAr ? 'متابعة الطلب عبر الواتساب' : 'Track Order via WhatsApp'}</span>
                </a>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  <Link
                    href="/store"
                    className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white font-bold text-xs text-stone-700 text-center hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#0b4a28]" />
                    <span>{isAr ? 'مواصلة التسوق' : 'Continue Shopping'}</span>
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white font-bold text-xs text-stone-700 text-center hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Home className="w-4 h-4 text-[#0b4a28]" />
                    <span>{isAr ? 'الرئيسية' : 'Home'}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
