'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OrderConfirmButton from './OrderConfirmButton';
import { useUI } from '../../../contexts/UIContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useStoreToast } from '../../components/StoreToastContext';
import {
  calcSubtotal,
  calcFinalTotal,
  calcDeliveryFee,
  roundMoney,
} from '@/lib/utils/pricing';
import type { OrderRow } from '@/lib/supabase/types';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Phone,
  MapPin,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Mail,
  Tag,
  X,
  AlertCircle,
  Loader,
  Home,
  LayoutGrid,
} from 'lucide-react';
import { WHATSAPP_LINK } from '../../../constants';

/** Global free-shipping threshold (mirrors store_settings.seed). */
const GLOBAL_FREE_SHIPPING_THRESHOLD = 500;

/** Bilingual city labels: English DB name → display label ("Arabic (English)"). */
const CITY_LABELS: Record<string, string> = {
  Casablanca: 'الدار البيضاء (Casablanca)',
  Rabat: 'الرباط (Rabat)',
  Marrakech: 'مراكش (Marrakech)',
  Fez: 'فاس (Fez)',
  Tangier: 'طنجة (Tangier)',
  Agadir: 'أكادير (Agadir)',
  Meknes: 'مكناس (Meknes)',
  Oujda: 'وجدة (Oujda)',
  Kenitra: 'القنيطرة (Kenitra)',
  Tetouan: 'تطوان (Tetouan)',
  Nador: 'الناظور (Nador)',
  Safi: 'آسفي (Safi)',
  'El Jadida': 'الجديدة (El Jadida)',
  'Beni Mellal': 'بني ملال (Beni Mellal)',
  Khouribga: 'خريبكة (Khouribga)',
};

interface ShippingMethodData {
  id: string;
  city_id: string;
  zone_id: string;
  zone_name?: string;
  name: string;
  slug: string;
  price: number;
  estimated_days: number;
  estimated_hours: number | null;
  description: string;
  is_active: boolean;
}

interface ShippingCityData {
  id: string;
  name: string;
  name_ar: string;
  zone_id: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  methods: ShippingMethodData[];
}

interface ShippingZoneData {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  cities: ShippingCityData[];
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  deliveryMethodId: string;
  couponCode: string;
  notes: string;
}

const INITIAL_FORM: FormData = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  deliveryMethodId: '',
  couponCode: '',
  notes: '',
};

export default function CheckoutClient() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useUI();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const { addToast } = useStoreToast();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [placing, setPlacing] = useState(false);
  const [shippingZones, setShippingZones] = useState<ShippingZoneData[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);

  // ─── Fetch shipping zones + cities + methods from DB (once) ──────
  useEffect(() => {
    const loadShipping = async () => {
      try {
        const res = await fetch('/api/shipping');
        const json = await res.json();
        if (json.success) {
          // API returns zones with nested cities, each city has nested methods
          const zones = (json.data ?? []).map((zone: ShippingZoneData) => ({
            ...zone,
            cities: (zone.cities ?? []).map((city: ShippingCityData) => ({
              ...city,
              methods: (city.methods ?? []).map((m: ShippingMethodData) => ({
                ...m,
                zone_name: zone.name,
              })),
            })),
          }));
          setShippingZones(zones);
        } else {
          throw new Error('Failed to load shipping zones');
        }
      } catch (e) {
        console.error(e);
        addToast('error', isAr ? 'فشل تحميل خيارات الشحن' : 'Failed to load shipping options');
      } finally {
        setShippingLoading(false);
      }
    };
    loadShipping();
  }, [addToast, isAr]);

  // ─── All cities across all zones (deduped) ───────────────────────
  const availableCities = useMemo(() => {
    const cities: string[] = [];
    for (const zone of shippingZones) {
      for (const city of zone.cities ?? []) {
        if (!cities.includes(city.name)) cities.push(city.name);
      }
    }
    return cities.sort();
  }, [shippingZones]);

  /** Delivery methods available for the currently selected city. */
  const deliveryOptionsForCity = useMemo<ShippingMethodData[]>(() => {
    if (!form.city) return [];
    if (form.city === 'Other City') return [];
    for (const zone of shippingZones) {
      for (const city of zone.cities ?? []) {
        if (city.name.toLowerCase() === form.city.toLowerCase()) {
          return (city.methods ?? []).filter((m) => m.is_active);
        }
      }
    }
    return [];
  }, [shippingZones, form.city]);

  // ─── Auto-select cheapest delivery method when city changes ─────
  const handleCityChange = useCallback((val: string) => {
    setForm((prev) => ({ ...prev, city: val, deliveryMethodId: '' }));
    setErrors((prev) => ({ ...prev, city: '', deliveryMethodId: '' }));
  }, []);

  // ─── Live calculations ───────────────────────────────────────────
  const itemsForPricing = cartItems.map((item) => ({
    price: item.price,
    qty: item.qty,
  }));
  const subtotal = calcSubtotal(itemsForPricing);

  // Auto-select cheapest delivery method for the chosen city (derived via useMemo)
  const selectedMethod = useMemo(() => {
    if (!form.city || form.city === 'Other City' || deliveryOptionsForCity.length === 0) return undefined;
    const current = deliveryOptionsForCity.find((m) => m.id === form.deliveryMethodId);
    if (current) return current;
    return deliveryOptionsForCity[0];
  }, [form.city, deliveryOptionsForCity, form.deliveryMethodId]);

  const deliveryFee = useMemo(() => {
    if (!selectedMethod) return 0;
    return calcDeliveryFee({
      methodPrice: selectedMethod.price,
      freeShippingThreshold: null,
      subtotal,
      globalThreshold: GLOBAL_FREE_SHIPPING_THRESHOLD,
    });
  }, [selectedMethod, subtotal]);

  const discount = appliedCoupon?.discount ?? 0;
  const grandTotal = calcFinalTotal({ subtotal, deliveryFee, discount });

  // ─── Validation ──────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = isAr ? 'الرجاء إدخال الاسم الكامل' : 'Full name is required';
    }
    if (!form.phone.trim()) {
      newErrors.phone = isAr ? 'الرجاء إدخال رقم الهاتف للتأكيد' : 'Phone number is required';
    } else if (form.phone.trim().length < 8) {
      newErrors.phone = isAr ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }
    // Email: optional, but validate format if provided
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = isAr ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
    }
    if (!form.address.trim()) {
      newErrors.address = isAr ? 'الرجاء إدخال عنوان التسليم' : 'Shipping address is required';
    }
    if (!form.city) {
      newErrors.city = isAr ? 'الرجاء اختيار المدينة' : 'City is required';
    } else if (form.city === 'Other City') {
      newErrors.city = isAr ? 'نحن غير قادرين على التوصيل إلى مدينتك' : 'We cannot deliver to this city';
    }
    if (!selectedMethod) {
      newErrors.deliveryMethodId = isAr ? 'الرجاء اختيار طريقة التوصيل' : 'Delivery method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, isAr, selectedMethod]);

  // ─── Handle city change (with auto-select delivery method) ───────
  // ─── Coupon Apply ────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!form.couponCode.trim()) return;
    setCouponApplying(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.couponCode.trim(),
          subtotal,
          productIds: cartItems.map((i) => String(i.id)),
          customerPhone: form.phone.trim() || undefined,
          customerEmail: form.email.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.valid) {
        setAppliedCoupon({ code: form.couponCode.trim(), discount: json.data.discount || 0 });
        addToast('success', isAr ? `تم تطبيق الكوبون: خصم ${json.data.discount} د.م` : `Coupon applied: -${json.data.discount} MAD`);
      } else {
        addToast('error', json.data?.reason || (isAr ? 'الكوبون غير صالح' : 'Invalid coupon code'));
      }
    } catch (e) {
      addToast('error', isAr ? 'فشل تطبيق الكوبون' : 'Failed to apply coupon');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setForm((prev) => ({ ...prev, couponCode: '' }));
  };

  // ─── Confirm Order ───────────────────────────────────────────────
  const ANIMATION_DURATION = 8000; // must match OrderConfirmButton animation length

  const handleConfirmOrder = async () => {
    if (!validate()) return;
    setPlacing(true);

    // Wait for truck animation to finish first
    await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION));

    // Map cart items to CheckoutPayload items
    const items = cartItems.map((item) => ({
      productId: String(item.id),
      productName: item.name,
      productImage: typeof item.image === 'string' ? item.image : String(item.image ?? ''),
      qty: item.qty,
      unitPrice: item.price,
    }));

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim(),
      city: form.city,
      deliveryMethodId: selectedMethod?.id ?? '',
      couponCode: appliedCoupon?.code || undefined,
      notes: form.notes.trim() || undefined,
      items,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        const order: OrderRow = json.data.order;
        const confirmation = {
          order,
          items,
          appliedCoupon,
        };
        try {
          localStorage.setItem('last_sodfa_order', JSON.stringify(confirmation));
        } catch (e) {
          console.error(e);
        }
        clearCart();
        addToast('success', isAr ? 'تم تأكيد طلبك بنجاح!' : 'Order placed successfully!');
        router.push('/order-confirmation');
      } else {
        addToast('error', json.error?.message || (isAr ? 'فشل إنشاء الطلب' : 'Failed to place order'));
      }
    } catch (e) {
      addToast('error', isAr ? 'حدث خطأ أثناء إرسال الطلب' : 'An error occurred while placing your order');
    } finally {
      setPlacing(false);
    }
  };

  const handleChange = (field: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const cityOptions = [
    ...availableCities.map((c) => ({ value: c, label: CITY_LABELS[c] || c })),
    { value: 'Other City', label: isAr ? 'مدينة أخرى (Other City)' : 'Other City' },
  ];

  const hasCityError = form.city === 'Other City';

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="bg-stone-50 text-stone-800 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <main className="pt-8 pb-20">
        {/* Page Header & Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <ol className="flex items-center whitespace-nowrap mb-3">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="flex items-center text-sm text-stone-500 hover:text-emerald-800 transition-colors focus:outline-none focus:text-emerald-800"
              >
                <Home className="shrink-0 me-2 w-4 h-4" />
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
              <ChevronRight className="shrink-0 mx-2 w-4 h-4 text-stone-400" />
            </li>
            <li className="inline-flex items-center">
              <Link
                href="/store"
                className="flex items-center text-sm text-stone-500 hover:text-emerald-800 transition-colors focus:outline-none focus:text-emerald-800"
              >
                <LayoutGrid className="shrink-0 me-2 w-4 h-4" />
                {isAr ? 'المتجر' : 'Store'}
              </Link>
              <ChevronRight className="shrink-0 mx-2 w-4 h-4 text-stone-400" />
            </li>
            <li className="inline-flex items-center text-sm font-semibold text-stone-900 truncate max-w-[200px]" aria-current="page">
              {isAr ? 'إتمام الطلب' : 'Checkout'}
            </li>
          </ol>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight" style={{ color: '#0b2e22' }}>
            {isAr ? 'تأكيد طلبكِ والدفع عند الاستلام' : 'Complete Your Order — Cash on Delivery'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {isAr
              ? 'ادخلي معلومات التسليم أدناه، وسيصلكِ الطلب حتى باب البيت مع إمكانية الفحص قبل الدفع.'
              : 'Enter your delivery info below. Pay in cash when your order arrives at your doorstep.'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="max-w-xl mx-auto px-4 text-center py-16 bg-white rounded-3xl border border-stone-200 shadow-sm my-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(205, 165, 82, 0.12)' }}
            >
              <ShoppingBag className="w-10 h-10 text-[#cda552]" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">
              {isAr ? 'حقيبة التسوق فارغة حالياً' : 'Your shopping bag is empty'}
            </h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
              {isAr
                ? 'يبدو أنكِ لم تضيفي أي منتج إلى الحقيبة بعد. تصفحي متجرنا واختاري منتجاتكِ المفضلة.'
                : 'You have no items in your cart. Explore our products and add items to proceed.'}
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)',
                color: '#f7ebd0',
              }}
            >
              <span>{isAr ? 'الذهاب إلى المتجر' : 'Browse Store'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        ) : (
          /* Main Checkout Grid */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
              {/* LEFT: Customer & Delivery Info Form */}
              <div className="space-y-6">
                {/* Information Card */}
                <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
                    >
                      <User className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">
                        {isAr ? 'معلومات التسليم والعنوان' : 'Delivery & Address Details'}
                      </h2>
                      <p className="text-xs text-stone-400">
                        {isAr ? 'يرجى إدخال معلومات دقيقة لضمان وصول الطلب بسرعة' : 'Please provide accurate info for smooth delivery'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#cda552]" />
                        <span>{isAr ? 'الاسم الكامل' : 'Full Name'}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder={isAr ? 'مثال: خديجة العلمي' : 'e.g. Khadija El Alami'}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-colors ${
                          errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-emerald-800'
                        }`}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>}
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#cda552]" />
                          <span>{isAr ? 'رقم الهاتف (للتأكيد والتسليم)' : 'Phone Number'}</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder={isAr ? 'مثال: 0612345678' : 'e.g. 0612345678'}
                          className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-colors ${
                            errors.phone ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-emerald-800'
                          }`}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#cda552]" />
                          <span>{isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder={isAr ? 'مثال: name@example.com' : 'e.g. name@example.com'}
                          className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-colors ${
                            errors.email ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-emerald-800'
                          }`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                        <p className="text-[10px] text-stone-400 mt-1">
                          {isAr ? 'للحصول على تحديثات حول طلبك' : 'For order updates and receipts'}
                        </p>
                      </div>
                    </div>

                    {/* City Select (dynamic from DB) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#cda552]" />
                        <span>{isAr ? 'المدينة' : 'City'}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      {shippingLoading ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-900 flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin text-stone-400" />
                          <span>{isAr ? 'جاري تحميل المدن...' : 'Loading cities...'}</span>
                        </div>
                      ) : (
                        <select
                          value={form.city}
                          onChange={(e) => handleCityChange(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-colors ${
                            errors.city ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-emerald-800'
                          }`}
                        >
                          <option value="">{isAr ? 'اختر مدينتك' : 'Select your city'}</option>
                          {cityOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.city && <p className="text-xs text-red-500 mt-1 font-medium">{errors.city}</p>}
                      {hasCityError && (
                        <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {isAr ? 'نحن غير قادرين على التوصيل إلى مدينتك. يرجى اختيار مدينة أخرى.' : 'We cannot deliver to this city. Please select another city.'}
                        </p>
                      )}
                    </div>

                    {/* Delivery Method Selection (dynamic from DB) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#cda552]" />
                        <span>{isAr ? 'طريقة التوصيل' : 'Delivery Method'}</span>
                        <span className="text-red-500">*</span>
                      </label>

                      {!form.city || hasCityError ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-400">
                          {isAr ? 'اختر مدينتك أولاً' : 'Select your city first'}
                        </div>
                      ) : deliveryOptionsForCity.length === 0 ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-400">
                          {isAr ? 'جاري تحميل خيارات التوصيل...' : 'Loading delivery options...'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {deliveryOptionsForCity.map((method) => {
                            const isSelected = selectedMethod?.id === method.id;
                            const isFree =
                              subtotal >= GLOBAL_FREE_SHIPPING_THRESHOLD;
                            const priceDisplay = isFree
                              ? (isAr ? 'مجاني 🎉' : 'FREE 🎉')
                              : `${method.price.toFixed(2)} ${isAr ? 'د.م' : 'MAD'}`;
                            return (
                              <div
                                key={method.id}
                                onClick={() => handleChange('deliveryMethodId', method.id)}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-emerald-800 bg-emerald-50'
                                    : 'border-stone-200 hover:border-stone-300'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-emerald-800' : 'text-stone-900'}`}>
                                      {method.name}
                                    </span>
                                    <span className="text-xs text-stone-500 block mt-0.5">
                                      {method.estimated_days} day(s)
                                    </span>
                                  </div>
                                  <span className={`text-sm font-bold ${isSelected ? 'text-emerald-800' : 'text-stone-900'}`}>
                                    {priceDisplay}
                                  </span>
                                </div>
                              </div>
                            );
                          })})
                        </div>
                      )}
                      {errors.deliveryMethodId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.deliveryMethodId}</p>}
                    </div>

                    {/* Full Address */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#cda552]" />
                        <span>{isAr ? 'عنوان التسليم بالتفصيل (الحي، الشارع، رقم المنزل)' : 'Detailed Shipping Address'}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder={isAr ? 'مثال: حي المعاريف، زنقة المعاريف رقم 45' : 'Street name, building number, apartment'}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-colors ${
                          errors.address ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-emerald-800'
                        }`}
                      />
                      {errors.address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>}
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#cda552]" />
                        <span>{isAr ? 'ملاحظات خاصة بالتسليم (اختياري)' : 'Delivery Notes (Optional)'}</span>
                      </label>
                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder={isAr ? 'مثال: يرجى الاتصال قبل الوصول بـ 30 دقيقة' : 'e.g. Call 30 mins before arrival'}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-emerald-800 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Badge: Cash on Delivery */}
                <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-900 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(205, 165, 82, 0.2)' }}
                    >
                      <Truck className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#cda552] uppercase tracking-wider">
                        {isAr ? 'طريقة الدفع المعتمدة' : 'Payment Method'}
                      </span>
                      <h3 className="text-lg font-bold text-stone-100">
                        {isAr ? '💵 الدفع نقداً عند الاستلام (COD)' : '💵 Cash on Delivery (COD)'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200/80 leading-relaxed pl-13">
                    {isAr
                      ? 'لن تدفعي أي درهم الآن. عند وصول موزّع الشحن إلى بيتكِ، يمكنكِ فحص المنتجات والتأكد منها ثم الدفع نقداً.'
                      : 'You pay zero upfront. Pay in cash directly to the courier after inspecting your package.'}
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5">
                    <Truck className="w-5 h-5 text-emerald-800" />
                    <span className="text-xs font-bold text-stone-800">
                      {isAr ? 'توصيل سريع' : 'Fast Shipping'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isAr ? 'خلال 24-48 ساعة' : 'Within 24-48h'}
                    </span>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold text-stone-800">
                      {isAr ? 'فحص قبل الدفع' : 'Inspect Package'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isAr ? 'ضمان 100%' : '100% Guaranteed'}
                    </span>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                    <span className="text-xs font-bold text-stone-800">
                      {isAr ? 'منتجات أصلية' : 'Original Items'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isAr ? 'مكونات طبيعية' : 'Natural ingredients'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Order Summary Card */}
              <div className="space-y-6 lg:sticky lg:top-24">
                <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                  <div
                    className="px-6 py-4 flex items-center justify-between text-white"
                    style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
                  >
                    <h2 className="text-base font-bold tracking-wide" style={{ color: '#f7ebd0' }}>
                      {isAr ? 'ملخص الطلب' : 'Order Summary'}
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/80 text-amber-300">
                      {cartItems.reduce((acc, i) => acc + i.qty, 0)} {isAr ? 'منتجات' : 'items'}
                    </span>
                  </div>

                  {/* Cart Items List */}
                  <div className="divide-y divide-stone-100 max-h-[320px] overflow-y-auto px-6">
                    {cartItems.map((item) => (
                      <div key={String(item.id)} className="py-3.5 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.qty}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                          <span className="text-[11px] text-stone-400">
                            {item.qty} × {item.price.toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-stone-900">
                          {(item.price * item.qty).toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="px-6 pt-4 border-t border-stone-100">
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.couponCode}
                          onChange={(e) => handleChange('couponCode', e.target.value)}
                          placeholder={isAr ? 'أدخل كوبون الخصم' : 'Enter coupon code'}
                          className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-emerald-800 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponApplying || !form.couponCode.trim() || !selectedMethod}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}
                        >
                          {couponApplying ? <Loader className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                          {isAr ? 'تطبيق' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-stone-900">{appliedCoupon.code}</span>
                          <span className="text-xs text-green-600">
                            {isAr ? `- خصم ${appliedCoupon.discount.toFixed(2)} د.م` : `-${appliedCoupon.discount.toFixed(2)} MAD`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subtotal, Discount, Shipping & Total */}
                  <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-3">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span className="font-bold text-stone-900">{roundMoney(subtotal).toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>{isAr ? 'الخصم:' : 'Discount:'}</span>
                        <span className="font-bold text-red-600">-{appliedCoupon.discount.toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-stone-600">
                      <span>{isAr ? 'رسوم الشحن والتوصيل:' : 'Shipping:'}</span>
                      <span className="font-bold text-emerald-700">
                        {deliveryFee === 0 ? (isAr ? 'مجاني 🎉' : 'FREE 🎉') : `${deliveryFee.toFixed(2)} ${isAr ? 'د.م' : 'MAD'}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 text-stone-900">
                      <span className="text-base font-extrabold">{isAr ? 'المجموع الكلي:' : 'Total:'}</span>
                      <span className="text-2xl font-black" style={{ color: '#0b2e22' }}>
                        {grandTotal.toFixed(2)}{' '}
                        <span className="text-sm font-bold text-stone-600">{isAr ? 'د.م' : 'MAD'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Order CTA Button */}
                <OrderConfirmButton
                  onClick={handleConfirmOrder}
                  disabled={placing || !selectedMethod || hasCityError}
                  total={`${grandTotal.toFixed(2)} ${isAr ? 'د.م' : 'MAD'}`}
                />

                {/* Direct WhatsApp Quick Order Backup */}
                <a
                  href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                    isAr
                      ? `مرحباً دار صودفا 🌿، أريد تأكيد طلبي لهذه المنتجات:\n` +
                        cartItems.map((i) => `• ${i.name} (الكمية: ${i.qty})`).join('\n') +
                        `\n\nالمجموع: ${grandTotal.toFixed(2)} د.م`
                      : `Hello SODFA Store 🌿, I would like to confirm my order:\n` +
                        cartItems.map((i) => `• ${i.name} (Qty: ${i.qty})`).join('\n') +
                        `\n\nTotal: ${grandTotal.toFixed(2)} MAD`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  }}
                >
                  <span>{isAr ? 'أو تأكيد الطلب مباشرة عبر الواتساب' : 'Or Confirm Order via WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
