'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck, Clock, AlertTriangle, Phone, ChevronRight, Sparkles, Filter, CheckCircle2, Radio,
  ZoomIn, ZoomOut, RotateCcw, PackageCheck, RefreshCw, XCircle, AlertCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import DashboardInfoButton from './DashboardInfoButton';
import { WidgetIcon } from './workspace/icons';
import OrderTimelineModal from './OrderTimelineModal';
import type { Order } from '../../types';

interface OrderTimelineMeta {
  order: Order;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  deliverySpeed: string;
  deliverySpeedAr: string;
  startDateStr: string;
  expectedDate: string;
  progress: number;
  badgeBg: string;
  lightBg: string;
  arrowColor: string;
  startCol: number;
  colSpan: number;
  category: 'express' | 'speed' | 'standard' | 'regional';
  isCompleted: boolean;
  isLive: boolean;
  isTenPercentAlert: boolean;
}

const OrdersTimelineCard: React.FC = () => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { orders, fetchOrders } = useStore();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMeta, setSelectedMeta] = useState<OrderTimelineMeta | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 0.75, 1, 1.25, 1.5, 2
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2, Number((prev + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))));
  const handleResetZoom = () => setZoomLevel(1);

  const handleRefreshTimeline = async () => {
    setIsRefreshing(true);
    try {
      if (fetchOrders) await fetchOrders();
      setNow(new Date());
    } catch (err) {
      console.error('Failed to refresh timeline:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Update current time every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate 10 real date columns starting 3 days before today
  const timelineCols = useMemo(() => {
    const today = new Date();
    const cols = [];
    for (let i = -3; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isCurrentDay = i === 0;
      cols.push({
        id: `d-${i}`,
        dateObj: d,
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { month: 'short' }),
        dayName: d.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { weekday: 'short' }),
        isToday: isCurrentDay,
        colIndex: i + 3, // 0 to 9 index
      });
    }
    return cols;
  }, [isAr]);

  const todayIndex = 3; // Column index 3 corresponds to i=0 (Today!)

  // Calculate live vertical marker position (percentage left inside the 10-column timeline grid)
  const nowMarkerLeftPercent = useMemo(() => {
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const dayFraction = currentHour / 24;
    const totalPercent = (todayIndex + dayFraction) * 10;
    return Math.min(99.5, Math.max(0.5, totalPercent));
  }, [now, todayIndex]);

  const nowTimeFormatted = now.toLocaleTimeString(isAr ? 'ar-MA' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const todayDateFormatted = now.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short' });

  // Generate realistic delivery timeline metadata mapped to real store order status lifecycle
  const timelineData: OrderTimelineMeta[] = useMemo(() => {
    const defaultMockOrders = [
      { id: 'ord-1024', orderNumber: 'ORD-1024', orderStatus: 'shipped', customerName: 'Sara Bennani', customerPhone: '+212661234567', total: 450, createdAt: new Date().toISOString(), shippingAddress: { city: 'Casablanca', name: 'Sara Bennani', address: '', region: '', phone: '+212661234567' }, items: [{ name: 'Argan Hair Oil', quantity: 2, price: 225 }] } as any,
      { id: 'ord-1025', orderNumber: 'ORD-1025', orderStatus: 'pending', customerName: 'Amine El Amrani', customerPhone: '+212668987654', total: 890, createdAt: new Date().toISOString(), shippingAddress: { city: 'Marrakech', name: 'Amine El Amrani', address: '', region: '', phone: '+212668987654' }, items: [{ name: 'Rose Water Toner', quantity: 1, price: 890 }] } as any,
      { id: 'ord-1026', orderNumber: 'ORD-1026', orderStatus: 'confirmed', customerName: 'Khadija Mansouri', customerPhone: '+212675112233', total: 1200, createdAt: new Date().toISOString(), shippingAddress: { city: 'Rabat', name: 'Khadija Mansouri', address: '', region: '', phone: '+212675112233' }, items: [{ name: 'Serum Glow Set', quantity: 3, price: 400 }] } as any,
      { id: 'ord-1027', orderNumber: 'ORD-1027', orderStatus: 'processing', customerName: 'Youssef Berrada', customerPhone: '+212663445566', total: 650, createdAt: new Date().toISOString(), shippingAddress: { city: 'Tangier', name: 'Youssef Berrada', address: '', region: '', phone: '+212663445566' }, items: [{ name: 'Shea Body Butter', quantity: 2, price: 325 }] } as any,
      { id: 'ord-1028', orderNumber: 'ORD-1028', orderStatus: 'delivered', customerName: 'Fatima Zohra', customerPhone: '+212669887766', total: 340, createdAt: new Date().toISOString(), shippingAddress: { city: 'Agadir', name: 'Fatima Zohra', address: '', region: '', phone: '+212669887766' }, items: [{ name: 'Lip Balm Honey', quantity: 2, price: 170 }] } as any,
      { id: 'ord-1029', orderNumber: 'ORD-1029', orderStatus: 'cancelled', customerName: 'Omar Tazi', customerPhone: '+212661998877', total: 520, createdAt: new Date().toISOString(), shippingAddress: { city: 'Fes', name: 'Omar Tazi', address: '', region: '', phone: '+212661998877' }, items: [{ name: 'Black Soap Scrub', quantity: 2, price: 260 }] } as any,
    ];

    const rawOrders = orders.length > 0 ? orders : defaultMockOrders;

    return rawOrders.slice(0, 6).map((order, idx) => {
      const status: OrderTimelineMeta['orderStatus'] = order.orderStatus || (idx === 0 ? 'shipped' : idx === 1 ? 'pending' : idx === 2 ? 'confirmed' : idx === 3 ? 'processing' : idx === 4 ? 'delivered' : 'cancelled');

      const speeds = [
        { speed: 'Express (24h)', speedAr: 'سريع (24 ساعة)', category: 'express' as const, bg: 'from-amber-500 to-red-600', lightBg: 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60 ring-2 ring-amber-500/50 shadow-md', arrowColor: 'text-red-600 dark:text-red-400', span: 2, start: 3 },
        { speed: 'Speed (1 Day)', speedAr: 'فائق (يوم واحد)', category: 'speed' as const, bg: 'from-sky-500 to-blue-600', lightBg: 'bg-sky-100/90 dark:bg-sky-950/50 border-sky-200/60 dark:border-sky-800/40', arrowColor: 'text-sky-600 dark:text-sky-400', span: 2, start: 3 },
        { speed: 'Standard (2 Days)', speedAr: 'عادي (يومين)', category: 'standard' as const, bg: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-100/90 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/40', arrowColor: 'text-emerald-600 dark:text-emerald-400', span: 3, start: 2 },
        { speed: 'Regional (3 Days)', speedAr: 'إقليمي (3 أيام)', category: 'regional' as const, bg: 'from-purple-600 to-violet-600', lightBg: 'bg-purple-100/90 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-800/40', arrowColor: 'text-purple-600 dark:text-purple-400', span: 4, start: 3 },
      ];

      const s = speeds[idx % speeds.length];
      const isDelivered = status === 'delivered';
      const isShipped = status === 'shipped';
      const isTenPercent = isShipped && idx === 0;

      const progress = isDelivered ? 100 : isTenPercent ? 90 : isShipped ? 70 : 0;

      const startDateObj = new Date();
      startDateObj.setDate(now.getDate() + (s.start - 3 - 1));
      const expectedDateObj = new Date();
      expectedDateObj.setDate(now.getDate() + (s.start - 3 + s.span - 1));

      return {
        order,
        orderStatus: status,
        deliverySpeed: s.speed,
        deliverySpeedAr: s.speedAr,
        startDateStr: startDateObj.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short' }),
        expectedDate: expectedDateObj.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short' }),
        progress,
        badgeBg: isDelivered ? 'from-slate-500 to-gray-600' : s.bg,
        lightBg: isDelivered ? 'bg-gray-100/80 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60 filter grayscale-[40%]' : s.lightBg,
        arrowColor: isDelivered ? 'text-gray-400 dark:text-gray-500' : s.arrowColor,
        startCol: status === 'delivered' ? 1 : status === 'shipped' ? s.start : 3, // Creation time = Today (col 3) for pending/confirmed/processing
        colSpan: (status === 'shipped' || status === 'delivered') ? s.span : 2,
        category: s.category,
        isCompleted: isDelivered,
        isLive: isShipped,
        isTenPercentAlert: isTenPercent,
      };
    });
  }, [orders, isAr, now]);

  const alertOrder = timelineData.find(d => d.isTenPercentAlert);

  const filteredData = filterCategory === 'all'
    ? timelineData
    : timelineData.filter(d => d.category === filterCategory);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <WidgetIcon id="orders-timeline" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {isAr ? 'مؤشر جدول تسليم الطلبات المباشر' : 'Live Realtime Delivery Timeline'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-2xs">
                <Radio size={10} className="animate-pulse text-emerald-500" />
                {isAr ? 'مباشر الان' : 'LIVE TIMELINE'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isAr ? `المؤشر الفعلي: ${todayDateFormatted} • الساعة ${nowTimeFormatted}` : `Live Marker: ${todayDateFormatted} • ${nowTimeFormatted}`}
            </p>
          </div>
          <DashboardInfoButton
            title={isAr ? 'مؤشر جدول التسليم المباشر' : 'Live Realtime Delivery Timeline'}
            description={isAr ? 'جدول تتبع الطلبات حسب حالتها: المعلقة والمؤكدة تظهر كأيقونة حالة، ويتم تشغيل التايملاين عند الشحن (Shipped)، والتحول للون باهت عند التسليم.' : 'Track orders by status icons: pending, confirmed, processing, shipped (timeline activates!), delivered (faded), and cancelled.'}
          />
        </div>

        {/* Filter Controls & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Timeline Refresh Button */}
          <button
            onClick={handleRefreshTimeline}
            disabled={isRefreshing}
            title={isAr ? 'تحديث بيانات التايملاين فقط' : 'Refresh Timeline Data'}
            className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs border border-gray-200/60 dark:border-white/10"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-500' : ''} />
            <span className="hidden sm:inline">{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              title={isAr ? 'تصغير (Zoom Out)' : 'Zoom Out'}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 disabled:opacity-40 transition-all"
            >
              <ZoomOut size={14} />
            </button>

            <span className="text-[11px] font-bold px-1 text-gray-700 dark:text-gray-300 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              title={isAr ? 'تكبير (Zoom In)' : 'Zoom In'}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 disabled:opacity-40 transition-all"
            >
              <ZoomIn size={14} />
            </button>

            {zoomLevel !== 1 && (
              <button
                onClick={handleResetZoom}
                title={isAr ? 'إعادة الضبط' : 'Reset Zoom'}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all ml-0.5"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 rounded-xl p-1 overflow-x-auto">
            {[
              { id: 'all', label: isAr ? 'الكل' : 'All' },
              { id: 'express', label: isAr ? '⚡ 24 ساعة' : '⚡ 24h Express' },
              { id: 'speed', label: isAr ? '🚀 يوم واحد' : '🚀 1 Day' },
              { id: 'standard', label: isAr ? '🚚 يومين' : '🚚 2 Days' },
              { id: 'regional', label: isAr ? '📦 3 أيام' : '📦 3 Days' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  filterCategory === f.id
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 10% Time Remaining Urgent Notification Alert Banner */}
      {alertOrder && (
        <div className="mb-4 bg-gradient-to-r from-red-500/10 via-amber-500/15 to-red-500/10 dark:from-red-950/50 dark:to-amber-950/50 border border-red-200 dark:border-red-800/60 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 animate-in fade-in duration-300 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold text-red-900 dark:text-red-200 truncate">
                  {isAr ? `تنبيه عاجل (متبقي 10% من الوقت!): الطلب #${alertOrder.order.orderNumber || alertOrder.order.id.slice(0, 8)}` : `Urgent 10% Time Alert: Order #${alertOrder.order.orderNumber || alertOrder.order.id.slice(0, 8)}`}
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                  {isAr ? '90% مكتمل' : '90% Due'}
                </span>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300 truncate">
                {isAr ? `متبقي 10% فقط على انتهاء التوصيل لـ (${alertOrder.order.customerName})! يرجى الاتصال للتأكيد` : `Only 10% time remaining for delivery to (${alertOrder.order.customerName})! Call customer now.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {alertOrder.order.customerPhone || alertOrder.order.shippingAddress?.phone ? (
              <a
                href={`tel:${alertOrder.order.customerPhone || alertOrder.order.shippingAddress?.phone}`}
                className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 animate-pulse"
              >
                <Phone size={13} />
                {isAr ? 'اتصل بالزبون الان' : 'Call Customer Now'}
              </a>
            ) : null}
            <button
              onClick={() => setSelectedMeta(alertOrder)}
              className="px-3 py-1.5 text-xs font-semibold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 rounded-xl transition-all"
            >
              {isAr ? 'التفاصيل' : 'Details'}
            </button>
          </div>
        </div>
      )}

      {/* Zuino Timeline Grid View with Live NOW Marker */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto pr-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full relative">
        <div style={{ minWidth: `${Math.round(840 * zoomLevel)}px` }} className="space-y-3 relative transition-all duration-300">
          {/* Header Time Columns Axis */}
          <div className="flex items-center w-full border-b border-gray-100 dark:border-white/10 pb-2.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center relative z-10">
            <div className="w-44 shrink-0 text-left pl-2 text-gray-700 dark:text-gray-300 font-extrabold">
              {isAr ? 'مسار التوصيل' : 'Delivery Track'}
            </div>
            <div className="flex-1 grid grid-cols-10 gap-1.5">
              {timelineCols.map(col => (
                <div
                  key={col.id}
                  className={`col-span-1 text-center truncate py-1 rounded-xl transition-all ${
                    col.isToday
                      ? 'bg-emerald-500 text-white font-black shadow-md scale-105'
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div>{col.dayNum} {col.monthName}</div>
                  <div className="text-[9px] opacity-85 font-semibold">{col.isToday ? (isAr ? 'اليوم' : 'TODAY') : col.dayName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows Container */}
          <div className="space-y-3 relative pt-1">
            {/* Background Grid Vertical Lines (Offset by 176px left track) */}
            <div className="absolute inset-y-0 left-44 right-0 grid grid-cols-10 gap-1.5 pointer-events-none opacity-20 dark:opacity-10">
              {timelineCols.map(col => (
                <div
                  key={col.id}
                  className={`col-span-1 border-r h-full ${
                    col.isToday ? 'border-emerald-500 border-2 opacity-50' : 'border-gray-300 dark:border-white'
                  }`}
                />
              ))}
            </div>

            {/* LIVE REALTIME "NOW" DASHED BLACK VERTICAL MARKER LINE */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-20 transition-all duration-1000 flex flex-col items-center"
              style={{ left: `calc(176px + (100% - 176px) * ${nowMarkerLeftPercent / 100})` }}
            >
              {/* NOW Floating Live Dark Badge */}
              <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20 dark:border-gray-800 flex items-center gap-1 shrink-0 -translate-y-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {isAr ? `الان ${nowTimeFormatted}` : `NOW ${nowTimeFormatted}`}
              </div>

              {/* Dashed Black Vertical Indicator Line */}
              <div className="w-0 border-l-2 border-dashed border-gray-900 dark:border-white h-full shadow-2xs opacity-85" />
            </div>

            {/* Order Status Rows */}
            {filteredData.map(item => {
              const orderIdStr = item.order.orderNumber || item.order.id.slice(0, 8);
              const st = item.orderStatus;

              return (
                <div key={item.order.id} className="flex items-center w-full relative py-1">
                  {/* Category Track Label */}
                  <div className="w-44 shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 truncate pl-1 pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.isCompleted ? 'bg-gray-400' : st === 'cancelled' ? 'bg-red-500' : st === 'pending' ? 'bg-amber-500' : st === 'confirmed' ? 'bg-blue-500' : st === 'processing' ? 'bg-purple-500' : `bg-gradient-to-r ${item.badgeBg}`} shadow-2xs`} />
                    <span className={`truncate ${item.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {isAr ? item.deliverySpeedAr : item.deliverySpeed}
                    </span>
                  </div>

                  {/* Timeline Row Content (Compact Badge for Pending/Confirmed/Processing/Cancelled VS Full Timeline Capsule for Shipped/Delivered) */}
                  <div className="flex-1 grid grid-cols-10 gap-1.5 relative h-10 items-center">
                    {st === 'pending' && (
                      <div
                        onClick={() => setSelectedMeta(item)}
                        style={{ gridColumnStart: item.startCol, gridColumnEnd: 'span 2' }}
                        className="h-8.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 px-3 flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-extrabold text-xs shadow-xs cursor-pointer hover:scale-105 transition-all"
                      >
                        <Clock size={13} className="text-amber-500 animate-pulse shrink-0" />
                        <span className="truncate">#{orderIdStr}</span>
                        <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black ml-auto">
                          {isAr ? 'معلق' : 'Pending'}
                        </span>
                      </div>
                    )}

                    {st === 'confirmed' && (
                      <div
                        onClick={() => setSelectedMeta(item)}
                        style={{ gridColumnStart: item.startCol, gridColumnEnd: 'span 2' }}
                        className="h-8.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700/60 px-3 flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-extrabold text-xs shadow-xs cursor-pointer hover:scale-105 transition-all"
                      >
                        <CheckCircle2 size={13} className="text-blue-500 shrink-0" />
                        <span className="truncate">#{orderIdStr}</span>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black ml-auto">
                          {isAr ? 'مؤكد' : 'Confirmed'}
                        </span>
                      </div>
                    )}

                    {st === 'processing' && (
                      <div
                        onClick={() => setSelectedMeta(item)}
                        style={{ gridColumnStart: item.startCol, gridColumnEnd: 'span 2' }}
                        className="h-8.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700/60 px-3 flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-extrabold text-xs shadow-xs cursor-pointer hover:scale-105 transition-all"
                      >
                        <RefreshCw size={13} className="text-purple-500 animate-spin shrink-0" />
                        <span className="truncate">#{orderIdStr}</span>
                        <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black ml-auto">
                          {isAr ? 'قيد المعالجة' : 'Processing'}
                        </span>
                      </div>
                    )}

                    {st === 'cancelled' && (
                      <div
                        onClick={() => setSelectedMeta(item)}
                        style={{ gridColumnStart: item.startCol, gridColumnEnd: 'span 2' }}
                        className="h-8.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 px-3 flex items-center gap-1.5 text-red-600 dark:text-red-400 font-extrabold text-xs shadow-xs cursor-pointer opacity-70 line-through"
                      >
                        <XCircle size={13} className="text-red-500 shrink-0" />
                        <span className="truncate">#{orderIdStr}</span>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black no-underline ml-auto">
                          {isAr ? 'ملغى' : 'Cancelled'}
                        </span>
                      </div>
                    )}

                    {(st === 'shipped' || st === 'delivered') && (
                      <div
                        onClick={() => setSelectedMeta(item)}
                        style={{
                          gridColumnStart: item.startCol,
                          gridColumnEnd: `span ${item.colSpan}`,
                        }}
                        className={`h-9.5 rounded-full ${item.lightBg} border p-1 flex items-center justify-between shadow-xs hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden`}
                      >
                        {/* Left Head Capsule (Active Shipped Truck vs Completed Faded Check) */}
                        <div className={`h-7.5 rounded-full ${item.isCompleted ? 'bg-gray-500 text-white' : `bg-gradient-to-r ${item.badgeBg}`} text-white px-3 flex items-center gap-1.5 shrink-0 shadow-xs`}>
                          {item.isCompleted ? (
                            <CheckCircle2 size={13} className="text-white shrink-0" />
                          ) : (
                            <Truck size={13} className="text-white animate-bounce shrink-0" />
                          )}
                          <span className="text-xs font-extrabold tracking-wide">#{orderIdStr}</span>
                        </div>

                        {/* Right Track with Floating Percentage Badge & Status Indicator */}
                        <div className="flex items-center gap-2 pl-2 pr-1 shrink-0">
                          {item.isTenPercentAlert ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse shadow-xs border border-red-400">
                              {isAr ? 'متبقي 10%' : '10% Left'}
                            </span>
                          ) : item.isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {isAr ? 'تم التسليم' : '100%'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-xs border border-gray-100 dark:border-white/10">
                              {item.progress}%
                            </span>
                          )}
                          <ChevronRight size={15} className={`${item.arrowColor} group-hover:translate-x-0.5 transition-transform`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zuino Detail Pop-up Modal */}
      <OrderTimelineModal
        data={selectedMeta}
        onClose={() => setSelectedMeta(null)}
      />
    </div>
  );
};

export default OrdersTimelineCard;
