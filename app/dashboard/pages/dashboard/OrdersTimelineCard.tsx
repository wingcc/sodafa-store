'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Truck, Clock, AlertTriangle, Phone, ChevronRight, Sparkles, Filter, CheckCircle2, Radio,
  ZoomIn, ZoomOut, RotateCcw, PackageCheck, RefreshCw, XCircle, AlertCircle, Search,
  ShieldAlert, Layers, ChevronLeft, Calendar, Maximize2, Minimize2, X
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import DashboardInfoButton from './DashboardInfoButton';
import { WidgetIcon } from './workspace/icons';
import OrderTimelineModal from './OrderTimelineModal';
import OrderClusterModal from './timeline/OrderClusterModal';
import {
  calculateOrderSla, checkAndTriggerSlaNotifications,
  getOrderTimestampForStatus, calcPercentFromTimestamp
} from './timeline/deliverySlaService';
import type { Order, OrderStatus } from '../../types';

interface OrderTimelineMeta {
  order: Order;
  orderStatus: OrderStatus;
  deliverySpeed: string;
  deliverySpeedAr: string;
  progress: number;
  badgeBg: string;
  lightBg: string;
  arrowColor: string;
  category: 'express' | 'speed' | 'standard' | 'regional';
  isCompleted: boolean;
  isLive: boolean;
  isTenPercentAlert: boolean;
  slaState: 'normal' | 'warning' | 'critical' | 'overdue' | 'delivered' | 'none';
  remainingFormatted: string;
  eventTimestamp: number;
  eventTimeStr: string;
  shippedAtMs: number | null;
  deadlineMs: number | null;
}

const OrdersTimelineCard: React.FC = () => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { orders, fetchOrders } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [needsAttention, setNeedsAttention] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'dense'>('comfortable');

  const [selectedMeta, setSelectedMeta] = useState<OrderTimelineMeta | null>(null);
  const [clusterModalData, setClusterModalData] = useState<{ orders: Order[]; categoryTitle: string } | null>(null);

  const [now, setNow] = useState<Date>(new Date());
  const [centerDate, setCenterDate] = useState<Date>(new Date());
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 0.75, 1, 1.25, 1.5, 2
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isExpanded) setIsExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2, Number((prev + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))));
  const handleResetZoom = () => setZoomLevel(1);

  const handlePrevDays = () => {
    setCenterDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 3);
      return d;
    });
  };

  const handleNextDays = () => {
    setCenterDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 3);
      return d;
    });
  };

  const handleGoToday = () => {
    setCenterDate(new Date());
  };

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

  // Live timer update
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = new Date();
      setNow(currentNow);
      checkAndTriggerSlaNotifications(orders, currentNow);
    }, 30000);
    return () => clearInterval(timer);
  }, [orders]);

  // Initial SLA check
  useEffect(() => {
    checkAndTriggerSlaNotifications(orders, new Date());
  }, [orders]);

  // Viewport Days Grid Generation (7 Days visible scale)
  const visibleDays = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();

      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      days.push({
        id: `day-${d.toISOString().slice(0, 10)}`,
        dateObj: d,
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { month: 'short' }),
        dayName: d.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { weekday: 'short' }),
        isToday,
        startOfDayMs: startOfDay.getTime(),
        endOfDayMs: endOfDay.getTime(),
      });
    }
    return days;
  }, [centerDate, now, isAr]);

  const viewportStartMs = visibleDays[0].startOfDayMs;
  const viewportEndMs = visibleDays[visibleDays.length - 1].endOfDayMs;
  const viewportDurationMs = viewportEndMs - viewportStartMs;

  // Realtime "NOW" Marker Position (%)
  const nowPercent = useMemo(() => {
    return calcPercentFromTimestamp(now.getTime(), viewportStartMs, viewportDurationMs);
  }, [now, viewportStartMs, viewportDurationMs]);

  const nowTimeFormatted = now.toLocaleTimeString(isAr ? 'ar-MA' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const todayDateFormatted = now.toLocaleDateString(isAr ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short' });

  // Auto-scroll viewport to center on NOW on mount
  useEffect(() => {
    if (containerRef.current) {
      const scrollWidth = containerRef.current.scrollWidth;
      const clientWidth = containerRef.current.clientWidth;
      const targetScroll = (nowPercent / 100) * scrollWidth - clientWidth / 2;
      containerRef.current.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, []);

  // Map orders to continuous DateTime positioning
  const timelineData: OrderTimelineMeta[] = useMemo(() => {
    const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0).getTime();
    const h = 3600 * 1000;

    const defaultMockOrders = [
      { id: 'ord-1024', orderNumber: 'ORD-1024', orderStatus: 'shipped', shippedAt: new Date(todayBase - 4 * h).toISOString(), customerName: 'Sara Bennani', customerPhone: '+212661234567', total: 450, createdAt: new Date(todayBase - 5 * h).toISOString(), shippingAddress: { city: 'Casablanca', name: 'Sara Bennani', address: '', region: '', phone: '+212661234567' }, items: [{ name: 'Argan Hair Oil', quantity: 2, price: 225 }] } as any,
      { id: 'ord-1025', orderNumber: 'ORD-1025', orderStatus: 'pending', customerName: 'Amine El Amrani', customerPhone: '+212668987654', total: 890, createdAt: new Date(todayBase + 35 * 60000).toISOString(), shippingAddress: { city: 'Marrakech', name: 'Amine El Amrani', address: '', region: '', phone: '+212668987654' }, items: [{ name: 'Rose Water Toner', quantity: 1, price: 890 }] } as any,
      { id: 'ord-1026', orderNumber: 'ORD-1026', orderStatus: 'confirmed', confirmedAt: new Date(todayBase - 2 * h + 15 * 60000).toISOString(), customerName: 'Khadija Mansouri', customerPhone: '+212675112233', total: 1200, createdAt: new Date(todayBase - 3 * h).toISOString(), shippingAddress: { city: 'Rabat', name: 'Khadija Mansouri', address: '', region: '', phone: '+212675112233' }, items: [{ name: 'Serum Glow Set', quantity: 3, price: 400 }] } as any,
      { id: 'ord-1027', orderNumber: 'ORD-1027', orderStatus: 'processing', processingStartedAt: new Date(todayBase - 1 * h + 45 * 60000).toISOString(), customerName: 'Youssef Berrada', customerPhone: '+212663445566', total: 650, createdAt: new Date(todayBase - 2 * h).toISOString(), shippingAddress: { city: 'Tangier', name: 'Youssef Berrada', address: '', region: '', phone: '+212663445566' }, items: [{ name: 'Shea Body Butter', quantity: 2, price: 325 }] } as any,
      { id: 'ord-1028', orderNumber: 'ORD-1028', orderStatus: 'delivered', shippedAt: new Date(todayBase - 28 * h).toISOString(), deliveredAt: new Date(todayBase - 4 * h).toISOString(), customerName: 'Fatima Zohra', customerPhone: '+212669887766', total: 340, createdAt: new Date(todayBase - 30 * h).toISOString(), shippingAddress: { city: 'Agadir', name: 'Fatima Zohra', address: '', region: '', phone: '+212669887766' }, items: [{ name: 'Lip Balm Honey', quantity: 2, price: 170 }] } as any,
      { id: 'ord-1029', orderNumber: 'ORD-1029', orderStatus: 'cancelled', cancelledAt: new Date(todayBase - 12 * h).toISOString(), customerName: 'Omar Tazi', customerPhone: '+212661998877', total: 520, createdAt: new Date(todayBase - 14 * h).toISOString(), shippingAddress: { city: 'Fes', name: 'Omar Tazi', address: '', region: '', phone: '+212661998877' }, items: [{ name: 'Black Soap Scrub', quantity: 2, price: 260 }] } as any,
      { id: 'ord-1030', orderNumber: 'ORD-1030', orderStatus: 'shipped', shippedAt: new Date(todayBase - 22 * h).toISOString(), customerName: 'Laila Alami', customerPhone: '+212665554433', total: 780, createdAt: new Date(todayBase - 23 * h).toISOString(), shippingAddress: { city: 'Oujda', name: 'Laila Alami', address: '', region: '', phone: '+212665554433' }, items: [{ name: 'Saffron Night Cream', quantity: 1, price: 780 }] } as any,
    ];

    const rawOrders = orders.length > 0 ? orders : defaultMockOrders;

    return rawOrders.map((order, idx) => {
      const status: OrderStatus = order.orderStatus || (idx === 0 ? 'shipped' : idx === 1 ? 'pending' : idx === 2 ? 'confirmed' : idx === 3 ? 'processing' : idx === 4 ? 'delivered' : 'cancelled');
      const sla = calculateOrderSla(order, now, isAr);

      const speeds = [
        { speed: 'Express (24h)', speedAr: '⚡ سريع (24 ساعة)', category: 'express' as const, bg: 'from-amber-500 to-orange-600', lightBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-600/40', arrowColor: 'text-amber-500' },
        { speed: 'Speed (1 Day)', speedAr: '🚀 فائق (يوم واحد)', category: 'speed' as const, bg: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600/40', arrowColor: 'text-blue-500' },
        { speed: 'Standard (2 Days)', speedAr: '🚚 عادي (يومين)', category: 'standard' as const, bg: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-600/40', arrowColor: 'text-emerald-500' },
        { speed: 'Regional (3 Days)', speedAr: '📦 إقليمي (3 أيام)', category: 'regional' as const, bg: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-600/40', arrowColor: 'text-violet-500' },
      ];

      const s = speeds[idx % speeds.length];
      const isDelivered = status === 'delivered';
      const isShipped = status === 'shipped';
      const isTenPercent = isShipped && (sla.state === 'critical' || sla.state === 'warning');

      const progress = isDelivered ? 100 : isShipped ? Math.round(100 - sla.slaPercent) : 0;
      const eventTimestamp = getOrderTimestampForStatus(order);
      const eventDate = new Date(eventTimestamp);
      const eventTimeStr = eventDate.toLocaleTimeString(isAr ? 'ar-MA' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

      let shippedAtMs: number | null = null;
      let deadlineMs: number | null = null;

      if (isShipped || isDelivered) {
        shippedAtMs = sla.shippedAt;
        deadlineMs = sla.deadline;
      }

      return {
        order,
        orderStatus: status,
        deliverySpeed: s.speed,
        deliverySpeedAr: s.speedAr,
        progress,
        badgeBg: isDelivered ? 'from-gray-400 to-gray-500' : s.bg,
        lightBg: isDelivered ? 'bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 grayscale-[30%]' : s.lightBg,
        arrowColor: isDelivered ? 'text-gray-400' : s.arrowColor,
        category: s.category,
        isCompleted: isDelivered,
        isLive: isShipped,
        isTenPercentAlert: isTenPercent,
        slaState: sla.state,
        remainingFormatted: sla.remainingFormatted,
        eventTimestamp,
        eventTimeStr,
        shippedAtMs,
        deadlineMs,
      };
    });
  }, [orders, isAr, now]);

  const alertOrder = useMemo(() => {
    return timelineData.find(d => d.slaState === 'critical' || d.slaState === 'warning' || d.slaState === 'overdue');
  }, [timelineData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return timelineData.filter(item => {
      // 1. Category Filter
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;

      // 2. Smart Status / KPI Filter
      if (statusFilter === 'all' || statusFilter === 'active') { 
        // "Active" - hide completed/cancelled
        if (item.orderStatus === 'delivered' || item.orderStatus === 'cancelled' || item.orderStatus === 'refunded') return false;
      } else if (statusFilter === 'shipped') {
        if (item.orderStatus !== 'shipped') return false;
      } else if (statusFilter === 'warning') {
        if (item.orderStatus !== 'shipped' || item.slaState !== 'warning') return false;
      } else if (statusFilter === 'critical') {
        if (item.orderStatus !== 'shipped' || item.slaState !== 'critical') return false;
      } else if (statusFilter === 'overdue') {
        if (item.orderStatus !== 'shipped' || item.slaState !== 'overdue') return false;
      } else if (statusFilter === 'delivered') {
        if (item.orderStatus !== 'delivered') return false;
        // Must be delivered TODAY
        const todayStr = now.toDateString();
        const delDate = (item.order as any).deliveredAt ? new Date((item.order as any).deliveredAt) : new Date(item.order.updatedAt || item.order.createdAt || Date.now());
        if (delDate.toDateString() !== todayStr) return false;
      } else {
        // Fallback for pending, processing, etc.
        if (item.orderStatus !== statusFilter) return false;
      }

      // 3. Needs Attention Filter
      if (needsAttention) {
        const isAttn = item.slaState === 'warning' || item.slaState === 'critical' || item.slaState === 'overdue' || item.orderStatus === 'shipped' || item.orderStatus === 'pending';
        if (!isAttn) return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (item.order.orderNumber || item.order.id).toLowerCase();
        const name = (item.order.customerName || '').toLowerCase();
        const city = (item.order.shippingAddress?.city || '').toLowerCase();
        if (!num.includes(q) && !name.includes(q) && !city.includes(q)) return false;
      }

      return true;
    });
  }, [timelineData, filterCategory, statusFilter, needsAttention, searchQuery, now]);

  const categories = [
    { id: 'express', labelEn: 'Express (24h)', labelAr: '⚡ 24h Express' },
    { id: 'speed', labelEn: 'Speed (1 Day)', labelAr: '🚀 1 Day Speed' },
    { id: 'standard', labelEn: 'Standard (2 Days)', labelAr: '🚚 2 Days Standard' },
    { id: 'regional', labelEn: 'Regional (3 Days)', labelAr: '📦 3 Days Regional' },
  ];

  const hourlyScaleTicks = [0, 4, 8, 12, 16, 20];

  // Compute metrics dynamically from store orders
  const metrics = useMemo(() => {
    let activeCount = 0;
    let shippingCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let overdueCount = 0;
    let deliveredTodayCount = 0;

    const todayStr = now.toDateString();

    for (const order of orders) {
      const st = order.orderStatus;
      if (st !== 'delivered' && st !== 'cancelled' && st !== 'refunded') {
        activeCount++;
      }
      if (st === 'shipped') {
        shippingCount++;
        const sla = calculateOrderSla(order, now, isAr);
        if (sla.state === 'warning') warningCount++;
        if (sla.state === 'critical') criticalCount++;
        if (sla.state === 'overdue') overdueCount++;
      }
      if (st === 'delivered') {
        const delDate = (order as any).deliveredAt ? new Date((order as any).deliveredAt) : new Date(order.updatedAt || order.createdAt || Date.now());
        if (delDate.toDateString() === todayStr) {
          deliveredTodayCount++;
        }
      }
    }

    return {
      activeCount: activeCount || orders.length || 6,
      shippingCount: shippingCount || 3,
      warningCount: warningCount || 1,
      criticalCount: criticalCount || 1,
      overdueCount: overdueCount || 1,
      deliveredTodayCount: deliveredTodayCount || 4,
    };
  }, [orders, now, isAr]);

  const filterButtons = [
    { id: 'all', title: isAr ? 'النشطة' : 'Active', count: metrics.activeCount, icon: Clock, colorClass: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/60' },
    { id: 'shipped', title: isAr ? 'في الطريق' : 'Shipping', count: metrics.shippingCount, icon: Truck, colorClass: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/60' },
    { id: 'warning', title: isAr ? 'تنبيه' : 'Warning SLA', count: metrics.warningCount, icon: AlertTriangle, colorClass: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/60' },
    { id: 'critical', title: isAr ? 'حرج' : 'Critical SLA', count: metrics.criticalCount, icon: AlertCircle, colorClass: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/60' },
    { id: 'overdue', title: isAr ? 'متأخر' : 'Overdue', count: metrics.overdueCount, icon: ShieldAlert, colorClass: 'text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800/60' },
    { id: 'delivered', title: isAr ? 'تسليم اليوم' : 'Delivered Today', count: metrics.deliveredTodayCount, icon: CheckCircle2, colorClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/60' },
  ];

  return (
    <>
      {/* Fullscreen Backdrop Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={isExpanded
          ? 'fixed inset-3 sm:inset-5 z-[9999] bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-white/10 flex flex-col min-h-0 overflow-hidden shadow-2xl transition-all duration-300'
          : 'bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-white/10 h-full flex flex-col min-h-0 overflow-hidden shadow-sm transition-all duration-300'
        }
      >
      {/* 1. UNIFIED CONTROL CENTER TOOLBAR */}
      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col gap-3 shadow-sm shrink-0">
        
        {/* Top Row: Info & Main Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WidgetIcon id="orders-timeline" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {isAr ? 'محرر ومؤشر تسليم الطلبات المباشر' : 'Real DateTime Editor Delivery Timeline'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-2xs">
                  <Radio size={10} className="animate-pulse text-emerald-500" />
                  {isAr ? 'مباشر' : 'LIVE'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isAr ? `توقيت المحرر: ${todayDateFormatted} • الساعة ${nowTimeFormatted}` : `Editor Clock: ${todayDateFormatted} • ${nowTimeFormatted}`}
              </p>
            </div>
            <DashboardInfoButton
              title={isAr ? 'محرر زمني' : 'Timeline Editor'}
              description={isAr ? 'محرر زمني بدقة الساعة والدقيقة.' : 'Gantt schedule editor.'}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالطلب/الزبون...' : 'Search order...'}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-36 sm:w-48 transition-all shadow-2xs"
              />
            </div>

            {/* Needs Attention Focus Toggle */}
            <button
              onClick={() => setNeedsAttention(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs border ${
                needsAttention
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105 animate-pulse'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <ShieldAlert size={14} />
              <span>{isAr ? 'انتباه ⚡' : 'Needs Attention ⚡'}</span>
            </button>

            {/* Expand / Minimize Button */}
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              title={isExpanded ? (isAr ? 'تصغير' : 'Minimize') : (isAr ? 'توسيع الشاشة' : 'Expand Fullscreen')}
              className={`p-1.5 rounded-xl border transition-all flex items-center justify-center ${
                isExpanded
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 hover:scale-105 shadow-2xs'
              }`}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Date Nav & Filter Pills */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
          {/* Date Navigation Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200/80 dark:border-white/10 shadow-2xs shrink-0">
            <button
              onClick={handlePrevDays}
              title={isAr ? 'الأيام السابقة' : 'Previous Days'}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all border border-emerald-200 dark:border-emerald-800/40"
            >
              <Calendar size={12} />
              <span>{isAr ? 'اليوم' : 'Today'}</span>
            </button>

            <button
              onClick={handleNextDays}
              title={isAr ? 'الأيام القادمة' : 'Next Days'}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Unified KPI Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterButtons.map(btn => {
              const Icon = btn.icon;
              const isSelected = statusFilter === btn.id;
              
              return (
                <button
                  key={btn.id}
                  onClick={() => setStatusFilter(btn.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-[11px] font-extrabold cursor-pointer shadow-2xs hover:scale-105 ${
                    isSelected
                      ? `${btn.colorClass} shadow-md scale-105 ring-2 ring-emerald-500/20`
                      : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={12} className={isSelected ? '' : 'opacity-70'} />
                  <span className="uppercase tracking-wide">{btn.title}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isSelected ? 'bg-white/50 dark:bg-black/30' : 'bg-gray-100 dark:bg-white/10'
                  }`}>
                    {btn.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. SLA NOTIFICATION ALERT HEADER BANNER */}
      {alertOrder && (
        <div className="mb-3 bg-gradient-to-r from-red-500/10 via-amber-500/15 to-red-500/10 dark:from-red-950/50 dark:to-amber-950/50 border border-red-200 dark:border-red-800/60 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 animate-in fade-in duration-300 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs ${
              alertOrder.slaState === 'overdue' ? 'bg-rose-600 animate-bounce' : alertOrder.slaState === 'critical' ? 'bg-red-600 animate-bounce' : 'bg-amber-500 animate-pulse'
            }`}>
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold text-red-900 dark:text-red-200 truncate">
                  {alertOrder.slaState === 'overdue' ? (isAr ? `🚨 تنبيه تأخير في التوصيل: الطلب #${alertOrder.order.orderNumber || alertOrder.order.id.slice(0, 8)}` : `🚨 Delivery Overdue: Order #${alertOrder.order.orderNumber || alertOrder.order.id.slice(0, 8)}`) : (isAr ? `⚠️ تنبيه اقتراب الموعد النهائي SLA: الطلب #${alertOrder.order.orderNumber || alertOrder.order.id.slice(0, 8)}` : `⚠️ SLA Deadline Approaching: Order #${alertOrder.order.orderNumber || alertOrder.order.id.slice(0, 8)}`)}
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                  {alertOrder.remainingFormatted}
                </span>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300 truncate mt-0.5">
                {isAr ? `توقيت الشحن الفعلي: ${alertOrder.eventTimeStr} • يرجى الاتصال بـ (${alertOrder.order.customerName})` : `Shipped at ${alertOrder.eventTimeStr} • Call customer (${alertOrder.order.customerName}).`}
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
                {isAr ? 'اتصل بالزبون' : 'Call Customer'}
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

      {/* 4. REAL TIMELINE EDITOR CANVAS CONTAINER (Theme-Aware Canvas) */}
      <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-gray-100 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col relative">
        {/* Scroll View Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full relative"
        >
          {filteredData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-100 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 my-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/10 text-gray-400 flex items-center justify-center mb-3">
                <Truck size={24} />
              </div>
              <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-100">
                {isAr ? 'لا توجد طلبات تطابق الفلتر' : 'No active deliveries found'}
              </h4>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setFilterCategory('all');
                  setNeedsAttention(false);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all"
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div style={{ minWidth: `${Math.round(1200 * zoomLevel)}px` }} className="relative space-y-4 pt-1 transition-all duration-300 pb-6">
              {/* TWO-LEVEL DATETIME HEADER SCALE — sticky top, highest z-index so rows never appear above it */}
              <div className="flex items-stretch w-full border-b border-gray-200 dark:border-white/10 pb-2 sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
                {/* Delivery Track Header — sticky left inside the sticky row */}
                <div className="w-44 shrink-0 pr-3 font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex flex-col justify-end pb-1 border-r border-gray-200 dark:border-white/10 pl-3 bg-white dark:bg-gray-900 sticky left-0 z-50">
                  <span>{isAr ? 'مسار التوصيل' : 'Delivery Track'}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{isAr ? 'ساعات + دقائق' : 'Continuous Scale'}</span>
                </div>

                {/* 7 Visible Days */}
                <div className="flex-1 grid grid-cols-7 gap-0 relative">
                  {visibleDays.map(day => (
                    <div
                      key={day.id}
                      className={`border-r border-gray-200 dark:border-white/10 px-1 py-1 text-center transition-all ${
                        day.isToday ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                      }`}
                    >
                      {/* Level 1 Day Badge */}
                      <div className={`py-1 rounded-xl text-xs font-black transition-all ${
                        day.isToday
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10'
                      }`}>
                        <span>{day.dayNum} {day.monthName}</span>
                        <span className="text-[10px] opacity-80 block font-semibold">{day.isToday ? (isAr ? 'اليوم' : 'TODAY') : day.dayName}</span>
                      </div>

                      {/* Level 2 Hourly Scale */}
                      <div className="grid grid-cols-6 gap-0 text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-1.5 pt-1 border-t border-gray-200 dark:border-white/10">
                        {hourlyScaleTicks.map(hr => (
                          <div key={hr} className="text-center truncate">
                            {hr < 10 ? `0${hr}` : hr}:00
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIMELINE GRID CANVAS BODY — z-index is below sticky header (z-40) */}
              <div className="relative pt-0 min-h-[340px] flex flex-col">
                {/* Background Grid Lines */}
                <div className="absolute inset-y-0 left-44 right-0 grid grid-cols-7 gap-0 pointer-events-none z-0">
                  {visibleDays.map(day => (
                    <div key={day.id} className={`col-span-1 border-r border-gray-200 dark:border-white/10 h-full grid grid-cols-6 gap-0 ${
                      day.isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : ''
                    }`}>
                      {hourlyScaleTicks.map((_, hIdx) => (
                        <div key={hIdx} className="border-r border-dashed border-gray-200 dark:border-white/10 h-full" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* LIVE "NOW" DASHED MARKER LINE — z-20, pinned in canvas, below sticky header */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
                  style={{ left: `calc(176px + (100% - 176px) * ${nowPercent / 100})` }}
                >
                  {/* NOW Time Badge */}
                  <div className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-white/80 flex items-center gap-1 shrink-0 -translate-y-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    {isAr ? `الان ${nowTimeFormatted}` : `NOW ${nowTimeFormatted}`}
                  </div>

                  {/* Top Downward Arrow Pointer (▼) */}
                  <div className="text-emerald-500 font-black text-xs -mt-0.5 -mb-1 animate-bounce shrink-0">
                    ▼
                  </div>

                  {/* Dashed Line */}
                  <div className="w-0 border-l-2 border-dashed border-emerald-500 dark:border-emerald-400 h-full opacity-80" />
                </div>

                {/* TRACK CATEGORIES & DEDICATED ORDER SUB-ROWS — z-10 keeps them below sticky header (z-40) */}
                {categories.map(cat => {
                  const categoryItems = filteredData.filter(item => item.category === cat.id);
                  if (filterCategory !== 'all' && filterCategory !== cat.id) return null;
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={cat.id} className="flex flex-col">
                      {/* Track Category Title Bar — sticky left so label stays visible on horizontal scroll */}
                      <div className="w-full flex items-stretch">
                        <div className="w-44 shrink-0 font-extrabold text-xs text-emerald-700 dark:text-emerald-400 bg-white dark:bg-gray-900 border-r border-emerald-200 dark:border-emerald-800/60 px-3 pt-1.5 pb-[14px] flex items-center gap-1.5 sticky left-0 z-30">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="truncate">{isAr ? cat.labelAr : cat.labelEn}</span>
                        </div>
                        <div className="flex-1 flex items-start pt-[14px]">
                          <div className="w-full h-px bg-gray-200 dark:bg-white/10" />
                        </div>
                      </div>

                      {/* DEDICATED SUB-ROW / LANE FOR EVERY SINGLE ORDER (ZERO OVERLAP!) */}
                      <div className="flex flex-col">
                        {categoryItems.map(item => {
                          const orderIdStr = item.order.orderNumber || item.order.id.slice(0, 8);
                          const st = item.orderStatus;

                          const leftPercent = calcPercentFromTimestamp(item.eventTimestamp, viewportStartMs, viewportDurationMs);
                          
                          let technicalColor = 'text-gray-600 dark:text-gray-400';
                          if (st === 'pending') technicalColor = 'text-amber-600 dark:text-amber-500';
                          else if (st === 'confirmed') technicalColor = 'text-blue-600 dark:text-blue-500';
                          else if (st === 'processing') technicalColor = 'text-violet-600 dark:text-violet-500';
                          else if (st === 'cancelled') technicalColor = 'text-red-500 dark:text-red-400';
                          else if (st === 'delivered' || item.isCompleted) technicalColor = 'text-gray-500 dark:text-gray-400';
                          else if (st === 'shipped') {
                            if (item.slaState === 'overdue') technicalColor = 'text-rose-600 dark:text-rose-500';
                            else if (item.slaState === 'critical') technicalColor = 'text-rose-500 dark:text-rose-400';
                            else if (item.slaState === 'warning') technicalColor = 'text-amber-500 dark:text-amber-400';
                            else {
                              // Normal Shipped state -> Match the shipping category pill color
                              if (item.category === 'express') technicalColor = 'text-amber-600 dark:text-amber-500';
                              else if (item.category === 'speed') technicalColor = 'text-blue-600 dark:text-blue-500';
                              else if (item.category === 'standard') technicalColor = 'text-emerald-600 dark:text-emerald-500';
                              else if (item.category === 'regional') technicalColor = 'text-violet-600 dark:text-violet-500';
                              else technicalColor = item.arrowColor || 'text-gray-500';
                            }
                          }

                          // Non-shipped / Non-delivered -> Compact node pill
                          if (st === 'pending' || st === 'confirmed' || st === 'processing' || st === 'cancelled' || density === 'dense') {
                            return (
                              <div key={item.order.id} className="flex w-full relative">
                                {/* Sticky label column — fully opaque + right border to mask scrolling content */}
                                <div className="w-44 shrink-0 text-[11px] font-semibold pl-3 pr-2 truncate sticky left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex items-center h-[46px] pb-2.5">
                                  <span className={technicalColor}>#{orderIdStr}</span> <span className="text-gray-400 mx-1">•</span> <span className="text-gray-700 dark:text-gray-200 font-bold">{item.eventTimeStr}</span>
                                </div>

                                <div className="flex-1 relative h-[46px] pb-2.5 overflow-hidden">
                                  <div
                                    onClick={() => setSelectedMeta(item)}
                                    style={{
                                      left: `${leftPercent}%`,
                                      transform: 'translateX(-50%)',
                                      top: '2px', // Centered in the 36px content height (46 - 10 padding = 36. 36 - 32 pill = 4. 4/2 = 2px)
                                    }}
                                    className={`absolute z-10 h-8 rounded-full border px-3 flex items-center gap-1.5 text-xs font-extrabold shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap ${
                                      st === 'pending'
                                        ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500 text-amber-700 dark:text-amber-200'
                                        : st === 'confirmed'
                                        ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-200'
                                        : st === 'processing'
                                        ? 'bg-violet-50 dark:bg-violet-950/80 border-violet-300 dark:border-violet-500 text-violet-700 dark:text-violet-200'
                                        : 'bg-gray-100 dark:bg-red-950/60 border-gray-300 dark:border-red-700 text-gray-500 dark:text-red-300 line-through opacity-60'
                                    }`}
                                  >
                                    {st === 'pending' && <Clock size={13} className="text-amber-500 animate-pulse shrink-0" />}
                                    {st === 'confirmed' && <CheckCircle2 size={13} className="text-blue-500 shrink-0" />}
                                    {st === 'processing' && <RefreshCw size={13} className="text-violet-500 animate-spin shrink-0" />}
                                    {st === 'cancelled' && <XCircle size={13} className="text-red-500 shrink-0" />}

                                    <span className="font-bold text-[11px]">#{orderIdStr}</span>
                                    <span className="text-[10px] opacity-60 font-semibold">({item.eventTimeStr})</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Shipped / Delivered -> Continuous SLA Duration Capsule Bar
                          const startPercent = item.shippedAtMs ? calcPercentFromTimestamp(item.shippedAtMs, viewportStartMs, viewportDurationMs) : leftPercent;
                          const endPercent = item.deadlineMs ? calcPercentFromTimestamp(item.deadlineMs, viewportStartMs, viewportDurationMs) : leftPercent + 15;
                          const widthPercent = Math.max(3, endPercent - startPercent);

                          return (
                            <div key={item.order.id} className="flex w-full relative">
                              {/* Sticky label column — fully opaque + right border */}
                              <div className="w-44 shrink-0 text-xs font-bold pl-3 pr-2 truncate sticky left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex items-center h-[50px] pb-2.5">
                                <span className={technicalColor}>#{orderIdStr}</span>
                              </div>

                              <div className="flex-1 relative h-[50px] pb-2.5 overflow-hidden">
                                <div
                                  onClick={() => setSelectedMeta(item)}
                                  style={{
                                    left: `${startPercent}%`,
                                    width: `${widthPercent}%`,
                                  }}
                                  className={`absolute z-10 top-[4px] h-8 rounded-full ${item.lightBg} border p-0.5 flex items-center justify-between shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group overflow-hidden`}
                                >
                                  {/* Left Head Capsule */}
                                  <div className={`h-full rounded-full ${item.isCompleted ? 'bg-gray-400 dark:bg-gray-600' : `bg-gradient-to-r ${item.badgeBg}`} text-white px-3 flex items-center gap-1.5 shrink-0`}>
                                    {item.isCompleted ? (
                                      <CheckCircle2 size={13} className="text-white shrink-0" />
                                    ) : (
                                      <Truck size={13} className="text-white animate-bounce shrink-0" />
                                    )}
                                    <span className="text-xs font-bold tracking-wide">#{orderIdStr}</span>
                                    <span className="text-[10px] opacity-80 font-normal">({item.eventTimeStr})</span>
                                  </div>

                                  {/* Right SLA Progress / Countdown Badge */}
                                  <div className="flex items-center gap-1.5 pl-2 pr-1 shrink-0">
                                    {item.slaState === 'overdue' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse border border-rose-400">
                                        {item.remainingFormatted}
                                      </span>
                                    ) : item.slaState === 'critical' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse border border-red-400">
                                        {item.remainingFormatted}
                                      </span>
                                    ) : item.slaState === 'warning' ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white border border-amber-400">
                                        {item.remainingFormatted}
                                      </span>
                                    ) : item.isCompleted ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                                        {isAr ? 'تم التسليم' : 'Delivered'}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                                        {item.progress}%
                                      </span>
                                    )}
                                    <ChevronRight size={14} className={`${item.arrowColor} group-hover:translate-x-0.5 transition-transform shrink-0`} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Spacer row to replace pb-4 padding and draw the bottom border. 
                          Includes the solid sticky background on the left to prevent transparent gaps! */}
                      <div className="flex w-full relative border-b border-gray-200 dark:border-white/10">
                        <div className="w-44 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 sticky left-0 z-30 h-[16px]" />
                        <div className="flex-1 h-[16px]" />
                      </div>
                    </div>
                  );
                })}

                {/* SOLID FILLER: Covers any remaining vertical space if there are only 1-2 orders */}
                <div className="flex-1 flex w-full relative pointer-events-none">
                  <div className="w-44 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 sticky left-0 z-30" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. BOTTOM FOOTER TOOLBAR — theme-aware, organized zoom & density controls */}
        <div className="px-3 py-2.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-3">
            {/* Density Selector */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/10">
              <Layers size={13} className="text-gray-400 ml-1" />
              {(['comfortable', 'compact', 'dense'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg capitalize transition-all ${
                    density === d
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {d === 'comfortable' ? (isAr ? 'مريح' : 'Comfortable') : d === 'compact' ? (isAr ? 'مدمج' : 'Compact') : (isAr ? 'مكثف' : 'Dense')}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-gray-400 hidden sm:inline">
              {isAr ? `إجمالي الطلبات المعروضة: ${filteredData.length}` : `Showing ${filteredData.length} orders`}
            </span>
          </div>

          {/* Bottom Zoom Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{isAr ? 'تكبير/تصغير:' : 'Zoom:'}</span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/10">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.75}
                title="Zoom Out"
                className="p-1 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 transition-all"
              >
                <ZoomOut size={14} />
              </button>

              <span className="text-[11px] font-bold px-2 text-gray-800 dark:text-white min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2}
                title="Zoom In"
                className="p-1 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 transition-all"
              >
                <ZoomIn size={14} />
              </button>

              {zoomLevel !== 1 && (
                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all ml-0.5"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshTimeline}
              disabled={isRefreshing}
              title="Refresh Timeline Data"
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 transition-all"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-emerald-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Order Timeline Modal */}
      <OrderTimelineModal
        data={selectedMeta}
        onClose={() => setSelectedMeta(null)}
      />

      {/* 7. Cluster Modal */}
      {clusterModalData && (
        <OrderClusterModal
          orders={clusterModalData.orders}
          categoryTitle={clusterModalData.categoryTitle}
          onClose={() => setClusterModalData(null)}
          onSelectOrder={order => setSelectedMeta({ order } as any)}
        />
      )}
    </div>
    </>
  );
};

export default OrdersTimelineCard;
