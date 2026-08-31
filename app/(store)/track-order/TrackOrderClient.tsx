'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Order Placed', labelAr: 'تم استقبال الطلب', labelFr: 'Commande passée', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', labelAr: 'تم التأكيد', labelFr: 'Confirmée', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  processing: { label: 'Processing', labelAr: 'جاري التحضير', labelFr: 'En préparation', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Package },
  shipped: { label: 'Shipped', labelAr: 'مع شركة الشحن', labelFr: 'Expédiée', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  delivered: { label: 'Delivered', labelAr: 'تم التسليم', labelFr: 'Livrée', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', labelAr: 'ملغي', labelFr: 'Annulée', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

type StatusKey = keyof typeof STATUS_CONFIG;

const STATUS_FLOW: StatusKey[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function StatusBadge({ status, tr }: { status: OrderTrackingData['orderStatus']; tr: (ar: string, fr: string, en: string) => string }) {
  const config = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.cancelled;
  const Icon = config.icon;
  const label = tr(config.labelAr, config.labelFr, config.label);
  return (
    <div className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center gap-2 ${config.color}`}>
      <Icon size={16} />
      {label}
    </div>
  );
}

function PaymentBadge({ status, tr }: { status: OrderTrackingData['paymentStatus']; tr: (ar: string, fr: string, en: string) => string }) {
  if (status === 'paid') {
    return (
      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-1 border border-emerald-200">
        <CheckCircle2 size={14} />
        {tr('مدفوع', 'Payée', 'Paid')}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium flex items-center gap-1 border border-amber-200">
      <Clock size={14} />
      {tr('بانتظار الدفع', 'En attente', 'Payment pending')}
    </span>
  );
}

export default function TrackOrderClient() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const isFr = locale === 'fr';
  const tr = (ar: string, fr: string, en: string) => (isAr ? ar : isFr ? fr : en);
  const dir = isAr ? 'rtl' : 'ltr';

  const paymentMethodLabels: Record<string, string> = {
    cash_on_delivery: tr('الدفع عند الاستلام', 'Paiement à la livraison', 'Cash on Delivery'),
    credit_card: tr('بطاقة ائتمان', 'Carte bancaire', 'Credit Card'),
    bank_transfer: tr('تحويل بنكي', 'Virement bancaire', 'Bank Transfer'),
    mobile_payment: tr('دفع جوال', 'Paiement mobile', 'Mobile Payment'),
  };

  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'shipping' | 'summary' | 'notes'>('items');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-search when ?order= is in URL (from QR scan)
  useEffect(() => {
    const fromUrl = searchParams.get('order') || searchParams.get('orderNumber') || searchParams.get('order_number') || searchParams.get('id');
    if (fromUrl && !order && !loading) {
      const trimmed = fromUrl.trim();
      setOrderNumber(trimmed);
      // Defer to next tick to allow state to settle, then fetch
      setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchOrderByNumber(trimmed);
          if (data) setOrder(data);
          else setError(tr('لم يتم العثور على الطلب. يرجى التحقق وإعادة المحاولة.', 'Aucune commande trouvée. Vérifiez et réessayez.', 'No order found with this number. Please check and try again.'));
        } catch {
          setError(tr('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.', 'Une erreur inattendue est survenue. Veuillez réessayer.', 'An unexpected error occurred. Please try again later.'));
        } finally {
          setLoading(false);
        }
      }, 100);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError(tr('الرجاء إدخال رقم الطلب.', 'Veuillez entrer votre numéro de commande.', 'Please enter your order number.'));
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
        setError(tr('لم يتم العثور على الطلب. يرجى التحقق وإعادة المحاولة.', 'Aucune commande trouvée. Vérifiez et réessayez.', 'No order found with this number. Please check and try again.'));
      }
    } catch {
      setError(tr('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.', 'Une erreur inattendue est survenue. Veuillez réessayer.', 'An unexpected error occurred. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNumber(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="bg-[#F7F3E8] dark:bg-[#0a0f1a] min-h-screen" dir={dir}>
      <main className="py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 mb-3">
              <Sparkles size={14} className="text-amber-500" />
              {tr('تتبع سريع وآمن', 'Suivi rapide et sécurisé', 'Fast & secure tracking')}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: 'var(--disp, serif)' }}>
              {tr('تتبع طلبك', 'Suivez votre commande', 'Track Your Order')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm leading-relaxed">
              {tr(
                'أدخل رقم الطلب لرؤية الحالة الحالية وتحديثات التسليم لحظياً.',
                'Entrez votre numéro de commande pour voir le statut actuel et les mises à jour de livraison.',
                'Enter your order number to see the current status and delivery updates instantly.'
              )}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-5 sm:p-6 mb-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" style={{ left: isAr ? 'auto' : '12px', right: isAr ? '12px' : 'auto' }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={orderNumber}
                  onChange={handleInputChange}
                  placeholder={tr('مثال: SDF-20240115-ABCDEF', 'ex: SDF-20240115-ABCDEF', 'e.g. SDF-20240115-ABCDEF')}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-[#cda552]/30 focus:border-[#cda552] transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                  style={{ paddingLeft: isAr ? '16px' : '40px', paddingRight: isAr ? '40px' : '16px' }}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-[#0b4a28] to-[#166c3b] text-white font-semibold rounded-xl hover:shadow-lg hover:brightness-[1.05] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{tr('جارٍ البحث…', 'Recherche…', 'Searching…')}</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    {tr('تتبع الطلب', 'Suivre', 'Track Order')}
                  </>
                )}
              </button>
            </form>
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
                <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-white/30 mt-3 text-center">
              {tr('تجد رقم الطلب في رسالة التأكيد أو بريدك الإلكتروني.', 'Retrouvez votre numéro dans l’e-mail de confirmation.', 'Find your order number in your confirmation email.')}
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-5 animate-fade-up">
              {/* Hero Banner */}
              <div
                className="relative py-8 sm:py-10 px-6 text-center text-white overflow-hidden rounded-3xl border"
                style={{
                  background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 55%, #0d3428 100%)',
                  borderColor: 'rgba(205, 165, 82, 0.2)',
                }}
              >
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23cda552'/%3E%3C/svg%3E")` }} />
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
                    style={{ background: 'rgba(205, 165, 82, 0.15)', border: '2px solid #cda552' }}
                  >
                    <Package className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#cda552' }} />
                  </div>
                  <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/60 text-amber-300 border border-amber-300/20">
                    {tr('تفاصيل الطلب', 'Détails de la commande', 'Order Details')}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#f7ebd0' }}>
                    {tr('طلبك قيد المتابعة', 'Votre commande est suivie', 'Your Order is Tracked')}
                  </h2>
                  <div
                    className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shadow-md"
                    style={{ background: 'rgba(205, 165, 82, 0.1)', borderColor: 'rgba(205, 165, 82, 0.25)' }}
                  >
                    <span className="flex items-center gap-2 text-xs text-amber-200"><Package size={16} className="text-amber-300" />{tr('رقم الطلب:', 'Numéro:', 'Order:')}</span>
                    <span className="text-base font-black tracking-wider text-white break-all">{order.orderNumber}</span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{tr('الطلب', 'Commande', 'Order')}</p>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{order.orderNumber}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                      <Calendar size={14} className="shrink-0" />
                      {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-MA' : isFr ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={order.orderStatus} tr={tr} />
                    <PaymentBadge status={order.paymentStatus} tr={tr} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  {order.paymentMethod && (
                    <div className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <CreditCard size={16} className="text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{tr('الدفع:', 'Paiement:', 'Payment:')}</span>
                      <span className="text-gray-900 dark:text-white font-medium truncate">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                    </div>
                  )}
                  {order.deliveryMethod && (
                    <div className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <Truck size={16} className="text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{tr('التوصيل:', 'Livraison:', 'Delivery:')}</span>
                      <span className="text-gray-900 dark:text-white font-medium truncate">{order.deliveryMethod}</span>
                    </div>
                  )}
                  {order.trackingNumber && order.shippingProvider && (
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-2 text-sm p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/15">
                      <FileText size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="text-sky-700 dark:text-sky-300 font-medium">{tr('التتبع:', 'Suivi:', 'Tracking:')}</span>
                      <span className="font-mono text-gray-900 dark:text-white font-bold">{order.trackingNumber}</span>
                      <span className="text-gray-400">—</span>
                      <span className="text-gray-700 dark:text-gray-300">{order.shippingProvider}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-5 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock size={16} className="text-emerald-600" />
                    {tr('تقدم الطلب', 'Progression', 'Order Progress')}
                  </h3>
                  <button
                    onClick={() => setShowTimeline(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <FileText size={14} />
                    {tr('عرض السجل', 'Voir historique', 'View Timeline')}
                  </button>
                </div>
                {/* Desktop: horizontal */}
                <div className="hidden sm:block relative pt-2">
                  <div className="absolute top-[22px] left-[4%] right-[4%] h-1 bg-gray-100 dark:bg-white/10 rounded-full" />
                  <div
                    className="absolute top-[22px] left-[4%] h-1 bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${(STATUS_FLOW.indexOf(order.orderStatus as StatusKey) / (STATUS_FLOW.length - 1)) * 92}%` }}
                  />
                  <div className="flex justify-between items-start relative z-10">
                    {STATUS_FLOW.map((statusKey, index) => {
                      const config = STATUS_CONFIG[statusKey];
                      const currentIdx = STATUS_FLOW.indexOf(order.orderStatus as StatusKey);
                      const isCompleted = index <= currentIdx;
                      const isCurrent = index === currentIdx;
                      return (
                        <div key={statusKey} className="flex flex-col items-center gap-2 text-center flex-1">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-400'}`}>
                            {isCompleted ? <CheckCircle2 size={16} className="text-white" /> : index + 1}
                          </div>
                          <span className={`text-xs font-semibold leading-tight ${isCurrent ? 'text-emerald-700 dark:text-emerald-300' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {tr(config.labelAr, config.labelFr, config.label)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Mobile: vertical */}
                <div className="sm:hidden relative pl-6 border-l-2 border-gray-100 dark:border-white/10 space-y-0">
                  {STATUS_FLOW.map((statusKey, index) => {
                    const config = STATUS_CONFIG[statusKey];
                    const currentIdx = STATUS_FLOW.indexOf(order.orderStatus as StatusKey);
                    const isCompleted = index <= currentIdx;
                    const isCurrent = index === currentIdx;
                    return (
                      <div key={statusKey} className="relative flex items-center gap-3 py-3">
                        <div className={`absolute -left-[25px] w-7 h-7 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-400'}`}>
                          {isCompleted ? <CheckCircle2 size={14} className="text-white" /> : <span className="text-xs font-bold">{index + 1}</span>}
                        </div>
                        <span className={`text-sm font-medium ${isCurrent ? 'text-emerald-700 dark:text-emerald-300' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{tr(config.labelAr, config.labelFr, config.label)}</span>
                        {isCurrent && <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/15">{tr('حالياً', 'Actuel', 'Current')}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabbed Details — beautiful & organized */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="flex gap-1 p-1.5 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'items' as const, label: tr(`المنتجات (${order.items.length})`, `Articles (${order.items.length})`, `Items (${order.items.length})`), icon: ShoppingBag, count: order.items.length },
                    { id: 'shipping' as const, label: tr('التوصيل', 'Livraison', 'Shipping'), icon: MapPin, count: null },
                    { id: 'summary' as const, label: tr('الملخص', 'Résumé', 'Summary'), icon: CreditCard, count: null },
                    ...(order.notes ? [{ id: 'notes' as const, label: tr('ملاحظات', 'Notes', 'Notes'), icon: FileText, count: null }] : []),
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${activeTab === tab.id ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                      <tab.icon size={16} className={activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'} />
                      {tab.label}
                      {tab.count !== null && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>{tab.count}</span>}
                    </button>
                  ))}
                </div>

                <div className="p-5 sm:p-6 min-h-[280px]">
                  {activeTab === 'items' && (
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="group flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.07] hover:border-emerald-100 dark:hover:border-emerald-500/15 hover:shadow-sm transition-all">
                          <div className="relative shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.productName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 text-xs">img</div>
                            )}
                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow">×{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.productName}</p>
                            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                              {item.quantity} × {item.unitPrice?.toFixed(2) || '0.00'} {tr('د.م', 'MAD', 'MAD')}
                            </p>
                            {item.productId && (
                              <Link href={`/store/${item.productId}`} className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                                {tr('عرض المنتج', 'Voir produit', 'View product')} <ArrowRight size={12} className={isAr ? 'rotate-180' : ''} />
                              </Link>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-gray-900 dark:text-white">{Number(item.total).toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-white/40">{tr('د.م', 'MAD', 'MAD')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="max-w-lg mx-auto">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 flex items-center justify-center mx-auto">
                          <MapPin size={24} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-3">{tr('عنوان التوصيل', 'Adresse de livraison', 'Shipping Address')}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tr('سيتم توصيل طلبك إلى هذا العنوان', 'Votre commande sera livrée à cette adresse', 'Your order will be delivered to this address')}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0"><User size={18} className="text-gray-600 dark:text-gray-300" /></div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tr('الاسم', 'Nom', 'Name')}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{order.shippingAddress.name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0"><Phone size={18} className="text-gray-600 dark:text-gray-300" /></div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{tr('الهاتف', 'Téléphone', 'Phone')}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate" dir="ltr">{order.shippingAddress.phone || order.customerPhone}</p>
                            </div>
                          </div>
                          {order.shippingAddress.email && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0"><Mail size={18} className="text-gray-600 dark:text-gray-300" /></div>
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.shippingAddress.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                          <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.shippingAddress.city}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{order.shippingAddress.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'summary' && (
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center mx-auto">
                          <CreditCard size={24} />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-3">{tr('ملخص الطلب', 'Résumé', 'Order Summary')}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.orderNumber}</p>
                      </div>
                      <div className="space-y-3 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{tr('المجموع الفرعي', 'Sous-total', 'Subtotal')}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{Number(order.subtotal).toFixed(2)} {tr('د.م', 'MAD', 'MAD')}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Tag size={12} className="text-amber-500" />{tr('الخصم', 'Remise', 'Discount')}</span>
                            <span className="text-red-500 font-bold">-{Number(order.discount).toFixed(2)} {tr('د.م', 'MAD', 'MAD')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{tr('الشحن', 'Livraison', 'Shipping')}</span>
                          <span className={`font-medium ${order.shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                            {order.shippingCost === 0 ? tr('مجاني 🎉', 'Gratuit 🎉', 'FREE 🎉') : `${Number(order.shippingCost).toFixed(2)} ${tr('د.م', 'MAD', 'MAD')}`}
                          </span>
                        </div>
                        {order.couponCode && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/15">
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5"><Tag size={14} />{order.couponCode}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white font-bold">{tr('مطبق', 'Appliqué', 'Applied')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-base pt-4 border-t-2 border-gray-900 dark:border-white/10">
                          <span className="text-gray-900 dark:text-white">{tr('الإجمالي', 'Total', 'Total')}</span>
                          <span className="text-xl text-emerald-700 dark:text-emerald-400">{Number(order.total).toFixed(2)} {tr('د.م', 'MAD', 'MAD')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="max-w-lg mx-auto text-center py-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-3">{tr('ملاحظات الطلب', 'Notes', 'Order Notes')}</h4>
                      {order.notes ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 text-left" dir={dir}>{order.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-white/30 mt-2">{tr('لا توجد ملاحظات', 'Aucune note', 'No notes')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <a
                  href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                    tr(
                      `مرحباً دار صودفا 🌿، أريد الاستفسار عن طلبي رقم: *${order.orderNumber}*\nالاسم: ${order.customerName}\nالمجموع: ${Number(order.total).toFixed(2)} د.م`,
                      `Bonjour SODFA 🌿, je souhaite suivre ma commande : *${order.orderNumber}*\nNom: ${order.customerName}\nTotal: ${Number(order.total).toFixed(2)} MAD`,
                      `Hello SODFA Store 🌿, I want to trace my order: *${order.orderNumber}*\nName: ${order.customerName}\nTotal: ${Number(order.total).toFixed(2)} MAD`
                    )
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <span className="text-center leading-tight">{tr('متابعة عبر الواتساب', 'Suivi WhatsApp', 'Track via WhatsApp')}</span>
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/store" className="py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-sm text-gray-700 dark:text-gray-200 text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                    <ShoppingBag size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{tr('المتجر', 'Boutique', 'Store')}</span>
                  </Link>
                  <Link href="/" className="py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-sm text-gray-700 dark:text-gray-200 text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                    <Home size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{tr('الرئيسية', 'Accueil', 'Home')}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Timeline Modal — beautiful, detailed */}
      {showTimeline && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTimeline(false)} />
          <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><Clock size={18} className="text-emerald-600 dark:text-emerald-400" /></div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{tr('سجل الطلب', 'Historique', 'Order Timeline')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.orderNumber} • {order.timeline.length} {tr('خطوات', 'étapes', 'steps')}</p>
                </div>
              </div>
              <button onClick={() => setShowTimeline(false)} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                <XCircle size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative pl-8 border-l-2 border-gray-100 dark:border-white/10 space-y-6">
                {order.timeline.map((event, index) => {
                  const isLast = index === order.timeline.length - 1;
                  const statusKey = event.status as StatusKey;
                  const isCurrent = event.status === order.orderStatus;
                  const currentIdx = order.timeline.findIndex(e => e.status === order.orderStatus);
                  const isCompleted = currentIdx > index;
                  const config = STATUS_CONFIG[statusKey] || { label: event.status, labelAr: event.status, labelFr: event.status, color: 'text-gray-600', icon: Clock };
                  return (
                    <div key={index} className="relative">
                      <div className="absolute -left-[38px] top-0">
                        {isCompleted ? (
                          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md"><config.icon size={16} /></div>
                        ) : isCurrent ? (
                          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white ring-4 ring-amber-500/20 shadow-md"><config.icon size={16} /></div>
                        ) : (
                          <div className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400"><config.icon size={14} /></div>
                        )}
                      </div>
                      <div className={`p-4 rounded-2xl border ${isCurrent ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-sm font-bold ${isCurrent ? 'text-amber-900 dark:text-amber-100' : isCompleted ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-600 dark:text-gray-400'}`}>{tr(config.labelAr, config.labelFr, config.label || event.status)}</p>
                            {event.note && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed break-words bg-white/60 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5">{event.note}</p>}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap shrink-0 ${isCurrent ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                            {new Date(event.timestamp).toLocaleString(isAr ? 'ar-MA' : isFr ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {!isLast && <div className="absolute -left-[11px] top-9 bottom-0 w-0.5 bg-gray-100 dark:bg-white/10" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="shrink-0 p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] flex justify-end">
              <button onClick={() => setShowTimeline(false)} className="px-5 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15">
                {tr('إغلاق', 'Fermer', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
