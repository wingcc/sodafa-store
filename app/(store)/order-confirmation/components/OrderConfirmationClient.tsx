'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  MessageCircle,
  Home,
  ArrowRight,
  ArrowLeft,
  Mail,
  Tag,
  Clock,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Headset,
  X,
  Send,
} from 'lucide-react';
import OrderSteps from './OrderSteps';
import ReceiptPrinter from './ReceiptPrinter';
import { WHATSAPP_LINK } from '../../../constants';
import type { OrderRow } from '@/lib/supabase/types';

const receiptLogo = '/assets/Image/NavbarLogo.png';

interface ConfirmationItem {
  productId: string;
  productName: string;
  productImage: string;
  qty: number;
  unitPrice: number;
}

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface LastOrderData {
  order: OrderRow;
  items: ConfirmationItem[];
  appliedCoupon: AppliedCoupon | null;
}

export default function OrderConfirmationClient() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const [orderData, setOrderData] = useState<LastOrderData | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpName, setHelpName] = useState('');
  const [helpPhone, setHelpPhone] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSending, setHelpSending] = useState(false);
  const [helpSent, setHelpSent] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const saved = localStorage.getItem('last_sodfa_order');
      if (saved) {
        setOrderData(JSON.parse(saved) as LastOrderData);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    setOrderData(null);
  }, []);

  // Fallback mock data (only shown if localStorage is empty)
  const fallbackOrderData: LastOrderData = {
    order: {
      id: 'fallback',
      order_number: 'SDF-PLACEHOLDER',
      customer_id: null,
      customer_name: isAr ? 'خديجة العلمي' : 'Khadija El Alami',
      customer_email: '',
      customer_phone: '0612345678',
      subtotal: 199.0,
      discount: 0,
      shipping_cost: 0,
      total: 199.0,
      currency: 'MAD',
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      order_status: 'pending',
      shipping_address: {
        name: isAr ? 'خديجة العلمي' : 'Khadija El Alami',
        phone: '0612345678',
        address: '123 Rue Hassan II',
        city: 'Casablanca',
        email: null,
      },
      billing_address: {},
      notes: null,
      tracking_number: null,
      shipping_provider: null,
      delivery_method: 'Standard',
      coupon_code: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    items: [
      {
        productId: '1',
        productName: 'Hydra-Boost Vitamin C Serum',
        productImage: 'https://images.unsplash.com/photo-1730968856900-1d661cf77b74',
        qty: 1,
        unitPrice: 199.0,
      },
    ],
    appliedCoupon: null,
  };

  const activeData = orderData ?? (isMounted ? fallbackOrderData : null);

  if (!activeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-4" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#cda552]/30 bg-[#f7efd8] text-[#0d2f25]">
            <Package className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#cda552]">
            {isAr ? 'جارٍ تجهيز الطلب' : 'Preparing your order'}
          </p>
          <h2 className="mt-3 text-xl font-black text-[#0d2f25]">
            {isAr ? 'نستعد لعرض تفاصيل طلبك' : 'Loading order details'}
          </h2>
        </div>
      </div>
    );
  }

  const { order, items, appliedCoupon } = activeData;

  // Parse shipping address (stored as JSONB)
  const addr = order.shipping_address as {
    name?: string;
    phone?: string;
    email?: string | null;
    address?: string;
    city?: string;
  } | null;
  const customerName = addr?.name ?? order.customer_name ?? '';
  const customerPhone = addr?.phone ?? order.customer_phone ?? '';
  const customerEmail = addr?.email ?? order.customer_email;
  const city = addr?.city ?? '';
  const streetAddress = addr?.address ?? '';

  const deliveryFee = order.shipping_cost ?? 0;
  const subtotal = order.subtotal ?? 0;
  const discount = order.discount ?? 0;
  const total = order.total ?? 0;
  const hasDiscount = (appliedCoupon?.discount ?? 0) > 0;
  const hasCoupon = order.coupon_code || appliedCoupon?.code;

  const formattedDate = new Date(order.created_at).toLocaleDateString(
    isAr ? 'ar-MA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const whatsappTraceMsg = encodeURIComponent(
    isAr
      ? `مرحباً دار صودفا 🌿، أريد الاستفسار عن طلبي رقم: *${order.order_number}*\nالاسم: ${customerName}\nالمجموع: ${total.toFixed(2)} د.م`
      : `Hello SODFA Store 🌿, I want to trace my order: *${order.order_number}*\nName: ${customerName}\nTotal: ${total.toFixed(2)} MAD`
  );

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpName.trim() || !helpPhone.trim() || !helpMessage.trim()) return;
    if (helpEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(helpEmail)) return;
    setHelpSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: helpName.trim(),
          phone: helpPhone.trim(),
          email: helpEmail.trim() || undefined,
          message: `[Order ${order.order_number}] ${helpMessage.trim()}`,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error?.message || 'Failed');
      setHelpSent(true);
      setHelpName('');
      setHelpPhone('');
      setHelpEmail('');
      setHelpMessage('');
      setTimeout(() => {
        setHelpSent(false);
        setShowHelpModal(false);
      }, 2200);
    } catch (err: any) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'message',
            title: `Need Help - Order ${order.order_number}`,
            message: `From ${helpName} (${helpPhone}): ${helpMessage.slice(0,120)}`,
            priority: 'medium',
          }),
        });
        setHelpSent(true);
        setTimeout(() => {
          setHelpSent(false);
          setShowHelpModal(false);
        }, 2200);
      } catch {}
    } finally {
      setHelpSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-stone-800" dir={isAr ? 'rtl' : 'ltr'}>
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowHelpModal(false)}>
          <div className="absolute inset-0 bg-[#0a1a14]/70 backdrop-blur-[10px]" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] max-h-[88vh] bg-white rounded-[28px] shadow-[0_32px_80px_rgba(7,35,26,.35)] border border-stone-200/80 flex flex-col overflow-hidden animate-[legalIn_420ms_cubic-bezier(.16,1,.3,1)]"
          >
            {/* Header — editorial */}
            <div className="relative px-6 sm:px-7 pt-6 pb-5 border-b border-stone-100 bg-gradient-to-br from-[#f7efd8]/60 via-white to-white">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl grid place-items-center text-white shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #0d2f25, #1a5a3a)', boxShadow: '0 8px 20px rgba(13,47,37,.25)' }}>
                  <Headset className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a7d3b]">{isAr ? 'تواصل مباشر' : 'Contact Us Directly'}</p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-[#0d2f25]" style={{ fontFamily: 'var(--disp, serif)' }}>
                    {isAr ? 'تحتاج إلى مساعدة؟' : 'Need help with your order?'}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-[13px] leading-5 text-stone-500">
                    {isAr ? `الطلب #${order.order_number} — فريق صودفا جاهز للرد خلال دقائق.` : `Order #${order.order_number} — SODFA team replies within minutes.`}
                  </p>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-9 h-9 rounded-xl grid place-items-center border border-stone-200 bg-white text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition shrink-0"
                  aria-label={isAr ? 'إغلاق' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-auto p-5 sm:p-6 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a5a3a transparent' }}>
              {/* Quick contact cards */}
              <div className="grid grid-cols-2 gap-3">
                <a href={`${WHATSAPP_LINK}?text=${whatsappTraceMsg}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-[#25D366]/20 bg-[#f0fdf4] p-3.5 hover:bg-[#e6f9ec] hover:border-[#25D366]/30 transition">
                  <span className="w-10 h-10 rounded-xl grid place-items-center bg-[#25D366] text-white shadow shrink-0 group-hover:scale-105 transition"><MessageCircle className="w-5 h-5" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black text-[#0d2f25]">{isAr ? 'واتساب' : 'WhatsApp'}</span>
                    <span className="block text-[11px] text-stone-500 truncate">{isAr ? 'رد فوري' : 'Instant reply'}</span>
                  </span>
                </a>
                <a href={`tel:${customerPhone || '+212673932389'}`} className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 hover:bg-white hover:border-stone-300 transition">
                  <span className="w-10 h-10 rounded-xl grid place-items-center bg-white border border-stone-200 text-stone-700 shadow-sm shrink-0 group-hover:scale-105 transition"><Phone className="w-5 h-5" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black text-stone-800">{isAr ? 'اتصال' : 'Call'}</span>
                    <span className="block text-[11px] text-stone-500 truncate" dir="ltr">{customerPhone || '+212 673 932 389'}</span>
                  </span>
                </a>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-stone-200" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">{isAr ? 'أو أرسل رسالة' : 'Or send a message'}</span>
                <span className="h-px flex-1 bg-stone-200" />
              </div>

              {/* Contact form — beautiful, editor-like */}
              <form onSubmit={handleHelpSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold text-stone-700">{isAr ? 'الاسم' : 'Name'} <span className="text-red-500">*</span></span>
                    <input value={helpName} onChange={(e) => setHelpName(e.target.value)} required placeholder={isAr ? 'اسمك الكامل' : 'Your name'} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0d2f25] focus:ring-2 focus:ring-[#0d2f25]/10 focus:bg-white transition" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-stone-700">{isAr ? 'الهاتف' : 'Phone'} <span className="text-red-500">*</span></span>
                    <input value={helpPhone} onChange={(e) => setHelpPhone(e.target.value)} required type="tel" placeholder="+212 6XX XXX XXX" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0d2f25] focus:ring-2 focus:ring-[#0d2f25]/10 focus:bg-white transition" dir="ltr" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-stone-700">{isAr ? 'البريد الإلكتروني' : 'Email'} <span className="text-stone-400 font-normal text-[11px]">({isAr ? 'اختياري' : 'optional'})</span></span>
                  <input value={helpEmail} onChange={(e) => setHelpEmail(e.target.value)} type="email" placeholder="you@email.com" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0d2f25] focus:ring-2 focus:ring-[#0d2f25]/10 focus:bg-white transition" dir="ltr" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-700">{isAr ? 'رسالتك' : 'Message'} <span className="text-red-500">*</span></span>
                  <textarea value={helpMessage} onChange={(e) => setHelpMessage(e.target.value)} required rows={4} placeholder={isAr ? 'اكتب سؤالك حول الطلب، العنوان، أو التسليم...' : 'Write your question about order, address or delivery...'} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#0d2f25] focus:ring-2 focus:ring-[#0d2f25]/10 focus:bg-white transition resize-none" />
                  <span className="mt-1 block text-right text-[11px] text-stone-400">{helpMessage.length}/500</span>
                </label>

                <button
                  type="submit"
                  disabled={helpSending || helpSent}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  style={{ background: helpSent ? 'linear-gradient(135deg, #cda552, #b8922e)' : 'linear-gradient(135deg, #0d2f25, #1a5a3a)', boxShadow: '0 8px 20px rgba(13,47,37,.22)' }}
                >
                  {helpSending ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : helpSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {helpSent ? (isAr ? 'تم الإرسال ✓' : 'Sent ✓') : helpSending ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send message')}
                </button>
                <p className="text-center text-[11px] leading-4 text-stone-400">
                  {isAr ? 'بالضغط على إرسال، توافق على سياسة الخصوصية. تُحفظ رسالتك في لوحة التحكم.' : 'By sending, you agree to privacy policy. Your message is saved to dashboard.'}
                </p>
              </form>
            </div>

            <style>{`@keyframes legalIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}`}</style>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <section
          className="relative overflow-hidden rounded-[32px] border border-[#d6c59a]/70 shadow-[0_30px_90px_rgba(9,39,29,0.08)]"
          style={{
            background: 'linear-gradient(135deg, #061c16 0%, #0a2e22 44%, #123f2d 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(205,165,82,0.28) 0%, transparent 26%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12) 0%, transparent 24%), linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)`,
            }}
          />

          <div className="relative z-10 grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.8fr] lg:p-9">
            <div className="flex flex-col justify-center gap-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cda552]/30 bg-[#0d352a]/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300 sm:text-[10px]">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {isAr ? 'تم تأكيد الطلب' : 'Order Confirmed'}
              </div>

              <div className="space-y-3">
                <h1
                  className="text-2xl font-black tracking-tight sm:text-3xl lg:text-5xl"
                  style={{ color: '#f7ebd0', fontFamily: 'var(--disp, serif)' }}
                >
                  {isAr ? 'شكراً لكِ على طلبكِ من دار صودفا' : 'Thank you for your order'}
                </h1>

                <p className="max-w-xl text-xs leading-5 text-emerald-100/85 sm:text-sm sm:leading-6">
                  {isAr
                    ? 'تم تسجيل طلبك بنجاح وسيقوم فريقنا بتأكيد عنوان التسليم ومتابعة الشحنة حتى الوصول.'
                    : 'Your order is now in the queue for preparation, and our team will confirm the delivery details and keep you updated throughout the journey.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/70">
                    {isAr ? 'التاريخ' : 'Date'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{formattedDate}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/70">
                    {isAr ? 'الدفع' : 'Payment'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {isAr ? 'الدفع عند الاستلام' : 'Cash on delivery'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-stretch">
              <div className="w-full rounded-[28px] border border-[#cda552]/25 bg-[#f7efd8]/8 p-4 shadow-inner backdrop-blur-sm sm:p-5">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 sm:gap-3 sm:pb-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200/90 sm:text-[10px]">
                      {isAr ? 'رقم الطلب' : 'Order no.'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="truncate text-[0.72rem] font-black tracking-[0.12em] text-white sm:text-base sm:tracking-[0.18em]">
                        {order.order_number}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyOrderNumber}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#cda552]/35 bg-[#cda552]/10 text-amber-300 transition hover:bg-[#cda552]/20"
                    aria-label={isAr ? 'نسخ رقم الطلب' : 'Copy order number'}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs text-emerald-50/90 sm:text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5">
                    <span className="text-emerald-100/70">{isAr ? 'الحالة' : 'Status'}</span>
                    <span className="font-semibold text-white">{isAr ? 'تم التأكيد' : 'Confirmed'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5">
                    <span className="text-emerald-100/70">{isAr ? 'التوصيل' : 'Delivery'}</span>
                    <span className="font-semibold text-white">{order.delivery_method || (isAr ? 'قياسي' : 'Standard')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5">
                    <span className="text-emerald-100/70">{isAr ? 'الاستلام' : 'Arrival'}</span>
                    <span className="font-semibold text-amber-300">{isAr ? '24-48 ساعة' : '24–48 hours'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.82fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#cda552]">
                    {isAr ? 'مسار الطلب' : 'Order journey'}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#0d2f25] sm:text-2xl">
                    {isAr ? 'طلبك قيد التحضير' : 'Your order is being prepared'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d7c08d] bg-[#f8f1df] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4e3d1d] transition hover:bg-[#f4e6c0]"
                  >
                    <Headset className="h-3.5 w-3.5" />
                    {isAr ? 'مساعدة' : 'Need help?'}
                  </button>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isAr ? 'مؤكد' : 'Confirmed'}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <OrderSteps currentStep={1} />
              </div>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-[#0d2f25]">
                  {isAr ? 'تفاصيل الطلب' : 'Order details'}
                </h3>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500">
                  {items.reduce((acc, i) => acc + i.qty, 0)} {isAr ? 'عنصر' : 'items'}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-stone-200 bg-[#faf8f3] p-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e6b8] text-[#0d2f25]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">{isAr ? 'العنوان' : 'Address'}</p>
                  <p className="mt-2 text-sm font-semibold text-stone-800">{customerName}</p>
                  <p className="mt-1 text-xs text-stone-500">{customerPhone}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{city} — {streetAddress}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-[#faf8f3] p-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dfeee6] text-[#0d2f25]">
                    <Truck className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">{isAr ? 'التوصيل' : 'Delivery'}</p>
                  <p className="mt-2 text-sm font-semibold text-stone-800">{order.delivery_method || (isAr ? 'قياسي' : 'Standard')}</p>
                  {hasCoupon && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                      <Tag className="h-3.5 w-3.5" />
                      {order.coupon_code || (isAr ? 'كوبون' : 'Coupon')}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-stone-200 bg-[#faf8f3] p-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e4d7] text-[#0d2f25]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">{isAr ? 'معلومات' : 'Info'}</p>
                  {customerEmail && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-stone-600">
                      <Mail className="h-3.5 w-3.5" />
                      {customerEmail}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-stone-500">
                    {isAr ? 'حالة الدفع: قيد التأكيد' : 'Payment status: pending confirmation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)] overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 text-white sm:px-6"
                style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
              >
                <h3 className="text-base font-bold tracking-[0.12em] text-[#f7ebd0] uppercase">
                  {isAr ? 'عربة الطلب' : 'Order items'}
                </h3>
                <span className="rounded-full border border-[#cda552]/40 bg-[#123a2c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
                  {items.reduce((acc, i) => acc + i.qty, 0)} {isAr ? 'قطعة' : 'pieces'}
                </span>
              </div>

              <div className="divide-y divide-stone-100 px-5 sm:px-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                      <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-stone-900">{item.productName}</h4>
                      <p className="mt-1 text-xs text-stone-500">
                        {item.qty} × {item.unitPrice.toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-stone-900">
                      {(item.unitPrice * item.qty).toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="flex items-center gap-2">
              <Link
                href="/store"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition shadow-sm"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {isAr ? 'المتجر' : 'Continue shopping'}
              </Link>
              <Link
                href="/"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition shadow-sm"
              >
                <Home className="h-3.5 w-3.5" />
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
            </div>
            <div className="rounded-[28px] border border-stone-200 bg-[#f7f4ee] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-6 overflow-hidden">
              <ReceiptPrinter
                orderNumber={order.order_number}
                createdAt={order.created_at}
                paymentMethod={order.payment_method || ''}
                items={items}
                subtotal={subtotal}
                discount={discount}
                shippingCost={deliveryFee}
                total={total}
                isAr={isAr}
              />


            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
