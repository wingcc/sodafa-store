'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../sections/Navbar';
import { Footer } from '../../sections/Footer';
import { AnnouncementBar } from '../../sections/AnnouncementBar';
import { useLanguage } from '../../contexts/LanguageContext';
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
} from 'lucide-react';
import { WHATSAPP_LINK } from '../../constants';
import type { OrderRow } from '@/lib/supabase/types';

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
  const [orderData] = useState<LastOrderData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('last_sodfa_order');
        if (saved) {
          return JSON.parse(saved) as LastOrderData;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

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

  const activeData = orderData ?? fallbackOrderData;
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

  const steps = [
    { label: isAr ? 'تم استقبال الطلب' : 'Order Received', done: true },
    { label: isAr ? 'جاري التجهيز' : 'Processing', done: true },
    { label: isAr ? 'مع شركة الشحن' : 'In Transit', done: false },
    { label: isAr ? 'تم التسليم' : 'Delivered', done: false },
  ];

  const formattedDate = new Date(order.created_at).toLocaleDateString(
    isAr ? 'ar-MA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const whatsappTraceMsg = encodeURIComponent(
    isAr
      ? `مرحباً دار صودفا 🌿، أريد الاستفسار عن طلبي رقم: *${order.order_number}*\nالاسم: ${customerName}\nالمجموع: ${total.toFixed(2)} د.م`
      : `Hello SODFA Store 🌿, I want to trace my order: *${order.order_number}*\nName: ${customerName}\nTotal: ${total.toFixed(2)} MAD`
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <AnnouncementBar />
      <Navbar />

      <main className="pb-20">
        {/* Banner Section */}
        <section
          className="relative py-16 sm:py-20 px-4 text-center text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 60%, #0d3428 100%)',
            borderBottom: '1px solid rgba(205, 165, 82, 0.25)',
          }}
        >
          <div className="max-w-3xl mx-auto relative z-10 space-y-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
              style={{
                background: 'rgba(205, 165, 82, 0.18)',
                border: '2px solid #cda552',
              }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: '#cda552' }} />
            </div>

            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 text-amber-300 border border-amber-300/30">
              ✦ {isAr ? 'تم تأكيد طلبكِ بنجاح' : 'Order Confirmed'}
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#f7ebd0' }}>
              {isAr ? 'شكراً لكِ على ثقتكِ في دار صودفا!' : 'Thank You for Shopping with SODFA!'}
            </h1>

            <p className="text-sm text-emerald-200/90 max-w-lg mx-auto">
              {isAr
                ? 'تم تسجيل طلبكِ وسيتم الاتصال بكِ هاتفياً لتأكيد العنوان والتسليم خلال ساعات.'
                : 'Your order has been recorded. Our team will contact you shortly to confirm delivery.'}
            </p>

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
                {order.order_number}
              </span>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
          {/* Status & Progress Tracker */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#cda552] tracking-wider">
                  {isAr ? 'موعد التسليم المتوقع' : 'Estimated Delivery'}
                </span>
                <h3 className="text-xl font-extrabold text-stone-900" style={{ color: '#0b2e22' }}>
                  {isAr ? 'خلال 24 إلى 48 ساعة' : 'Within 24 to 48 Hours'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isAr ? `تاريخ الطلب: ${formattedDate}` : `Order date: ${formattedDate}`}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-800">
                  {isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                </span>
              </div>
            </div>

            {/* 4 Steps Tracker */}
            <div className="relative pt-2">
              <div className="flex justify-between items-center relative z-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center w-1/4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        step.done
                          ? 'bg-emerald-900 border-emerald-900 text-amber-300'
                          : 'bg-stone-100 border-stone-300 text-stone-400'
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="w-4 h-4 text-amber-300" /> : i + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        step.done ? 'text-stone-900' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info Card (with delivery method + coupon) */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#cda552] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-stone-900">
                  {isAr ? 'عنوان ومستلم الطلب:' : 'Delivery Address & Recipient:'}
                </h4>
                <p className="text-stone-700 font-medium">
                  {customerName} · {customerPhone}
                </p>
                {customerEmail && (
                  <p className="text-stone-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {customerEmail}
                  </p>
                )}
                <p className="text-stone-500">
                  {city} — {streetAddress}
                </p>
                {order.delivery_method && (
                  <p className="text-stone-500 flex items-center gap-1 pt-0.5">
                    <Truck className="w-3 h-3" />
                    {isAr ? `طريقة التوصيل: ${order.delivery_method}` : `Delivery Method: ${order.delivery_method}`}
                  </p>
                )}
                {hasCoupon && (
                  <p className="text-amber-700 font-medium pt-0.5 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {isAr ? `كوبون مطبق: ${order.coupon_code || hasCoupon}` : `Coupon applied: ${order.coupon_code || hasCoupon}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm">
            <div
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
            >
              <h2 className="text-base font-bold tracking-wide" style={{ color: '#f7ebd0' }}>
                {isAr ? 'تفاصيل المنتجات المطلوبة' : 'Order Items Summary'}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/80 text-amber-300">
                {items.reduce((acc, i) => acc + i.qty, 0)} {isAr ? 'منتجات' : 'items'}
              </span>
            </div>

            <div className="divide-y divide-stone-100 px-6">
              {items.map((item) => (
                <div key={item.productId} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {item.productName}
                    </h4>
                    <span className="text-xs text-stone-400">
                      {item.qty} × {item.unitPrice.toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    {(item.unitPrice * item.qty).toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 p-6 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-bold text-stone-900">{subtotal.toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
              </div>

              {hasDiscount && (
                <div className="flex justify-between text-stone-600">
                  <span>{isAr ? 'الخصم:' : 'Discount:'}</span>
                  <span className="font-bold text-red-600">-{discount.toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>{isAr ? 'الشحن والتوصيل:' : 'Shipping:'}</span>
                <span className="font-bold text-emerald-700">
                  {deliveryFee === 0 ? (isAr ? 'مجاني 🎉' : 'FREE 🎉') : `${deliveryFee.toFixed(2)} ${isAr ? 'د.م' : 'MAD'}`}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 text-stone-900">
                <span className="text-sm font-bold">{isAr ? 'المبلغ الإجمالي عند الاستلام:' : 'Total Cash on Delivery:'}</span>
                <span className="text-xl font-black" style={{ color: '#0b2e22' }}>
                  {total.toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: WhatsApp Trace + Return Home */}
          <div className="space-y-3 pt-2">
            <a
              href={`${WHATSAPP_LINK}?text=${whatsappTraceMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
              }}
            >
              <MessageCircle className="w-5 h-5" />
              <span>
                {isAr ? 'متابعة الطلب وتأكيده عبر الواتساب' : 'Track Order via WhatsApp'}
              </span>
            </a>

            <div className="flex gap-3">
              <Link
                href="/store"
                className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white font-bold text-xs text-stone-700 text-center hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                <span>{isAr ? 'مواصلة التسوق' : 'Continue Shopping'}</span>
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white font-bold text-xs text-stone-700 text-center hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4 text-emerald-800" />
                <span>{isAr ? 'الرئيسية' : 'Home'}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
