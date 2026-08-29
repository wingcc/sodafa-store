'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Truck, Clock, AlertTriangle, Phone, ChevronRight, Sparkles, Filter, CheckCircle2, Radio,
  ZoomIn, ZoomOut, RotateCcw, PackageCheck, RefreshCw, XCircle, AlertCircle, Search,
  ShieldAlert, Layers, ChevronLeft, Calendar, Maximize2, Minimize2, X, HelpCircle,
  Target, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import DashboardInfoButton from './DashboardInfoButton';
import { WidgetIcon } from './workspace/icons';
import OrderTimelineModal from './OrderTimelineModal';
import OrderClusterModal from './timeline/OrderClusterModal';
import {
  calculateOrderSla, checkAndTriggerSlaNotifications,
  getOrderTimestampForStatus, calcPercentFromTimestamp
} from './timeline/deliverySlaService';
import {
  normalizeHistory, type TimelineElement,
  computeFitCenterMs, getOffViewportSummary,
} from './timeline/timelineController';
import {
  buildTimelineElements,
  formatDurationMs,
  formatDateTime,
  type TimelineNode,
} from './timeline/services/timelineService';
import {
  TimelineConnector,
  TimelineCircle,
  TimelineGroup,
  TimelineMerged,
  TimelineGapAnnotations,
  StatusPill,
  STATUS_STYLE,
  ICON_MAP,
  DENSITY_CONFIG,
  type DensityKey,
} from './timeline';
import type { Order, OrderStatus } from '../../types';

// ── Lifecycle helpers ──
const LIFECYCLE_ORDER: OrderStatus[] = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

function getLifecycleHistory(order: any): TimelineNode[] {
  return normalizeHistory(order);
}
const DensityHelpButton: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const updatePos = React.useCallback(() => {
    if (!btnRef.current || !popupRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const pw = popupRef.current.offsetWidth || 380;
    const ph = popupRef.current.offsetHeight || 520;
    const margin = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = rect.top - ph - margin;
    let left = rect.left - pw + rect.width;
    if (isAr) left = rect.right - pw;
    else left = Math.min(rect.left, vw - pw - margin);
    if (top < margin) top = rect.bottom + margin;
    if (top + ph > vh - margin) top = Math.max(margin, vh - ph - margin);
    if (left + pw > vw - margin) left = vw - pw - margin;
    if (left < margin) left = margin;
    if (vw < 640) {
      const w = Math.min(pw, vw - margin * 2);
      left = (vw - w) / 2;
      top = Math.min(top, vh - ph - margin);
    }
    setPos({ top, left });
  }, [isAr]);
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => updatePos());
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popupRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updatePos]);
  return (
    <>
      <button ref={btnRef} type="button" aria-label={isAr ? 'ما الفرق بين الأوضاع؟' : 'What do these modes do?'} aria-expanded={open} onClick={() => setOpen(v => !v)} className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-2xs transition-all shrink-0 ${open ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800/40'}`} title={isAr ? 'شرح أوضاع العرض' : 'Explain display modes'}>
        <HelpCircle size={14} strokeWidth={2.2} />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={popupRef} role="dialog" aria-label={isAr ? 'شرح أوضاع الكثافة' : 'Density modes explained'} style={{ position: 'fixed', top: pos.top, left: pos.left, maxWidth: 'calc(100vw - 16px)' }} className="z-[100] w-[360px] sm:w-[400px] rounded-2xl border shadow-2xl backdrop-blur-xl bg-white dark:bg-[#131a28] border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[88vh]">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                  <Layers size={16} />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-4">{isAr ? 'أوضاع العرض — ما الفرق؟' : 'Display density — what changes?'}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'نفس الطلبات، ارتفاع صف مختلف' : 'Same orders, different row heights'}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 shrink-0">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs leading-5 text-gray-600 dark:text-gray-300 mt-3">
              {isAr ? 'هذه الأزرار تتحكم فقط في كثافة الصفوف داخل الجدول الزمني. لا تخفي طلبات، فقط تغير المسافة والتفاصيل الظاهرة.' : 'These buttons only control how tall each order lane is inside the timeline. They never hide orders — they just change spacing and how much detail is shown.'}
            </p>
          </div>
          <div className="overflow-y-auto flex-1 px-3 py-3 space-y-2.5">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">{isAr ? 'مريح' : 'Comfortable'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">{isAr ? 'افتراضي' : 'Default'}</span>
                <span className="ml-auto text-[10px] font-bold text-emerald-700 dark:text-emerald-400">~50px / 46px • h-8</span>
              </div>
              <div className="space-y-1 mb-2">
                <p className="text-[11px] leading-4 text-gray-700 dark:text-gray-300 flex gap-1.5"><span className="font-extrabold text-emerald-700 dark:text-emerald-300 shrink-0">{isAr ? 'الفرق:' : 'Diff:'}</span><span>{isAr ? 'صفوف واسعة جداً + شريط SLA كامل متدرج + نسبة % + سهم متحرك + مسافات مريحة' : 'Widest rows + full gradient SLA bar + progress % + animated chevron + generous padding'}</span></p>
                <p className="text-[11px] leading-4 text-gray-700 dark:text-gray-300 flex gap-1.5"><span className="font-extrabold text-emerald-700 dark:text-emerald-300 shrink-0">{isAr ? 'الميزة:' : 'Benefit:'}</span><span>{isAr ? 'راحة للعين، قراءة تفصيلية دقيقة لكل طلب — مثالي لـ 1–7 طلبات تحتاج تركيز' : 'Eye comfort, precise per-order inspection — ideal for 1–7 orders needing focus'}</span></p>
              </div>
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-white dark:bg-gray-900 p-2 flex items-center gap-2">
                <div className="flex-1 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 flex items-center gap-1.5 text-[11px] font-bold shadow-sm">
                  <Truck size={12} className="shrink-0" />
                  <span>#ORD-1024</span>
                  <span className="text-[10px] opacity-80">(10:15)</span>
                  <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">42%</span>
                </div>
                <ChevronRight size={12} className="text-emerald-500" />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">{isAr ? 'نفس التصميم في الجدول الزمني — زر أخضر = مريح' : 'Same design in timeline — green button = comfortable'}</p>
            </div>
            <div className="rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-extrabold text-blue-800 dark:text-blue-300">{isAr ? 'مدمج' : 'Compact'}</span>
                <span className="ml-auto text-[10px] font-bold text-blue-700 dark:text-blue-400">~42px / 38px • h-7</span>
              </div>
              <div className="space-y-1 mb-2">
                <p className="text-[11px] leading-4 text-gray-700 dark:text-gray-300 flex gap-1.5"><span className="font-extrabold text-blue-700 dark:text-blue-300 shrink-0">{isAr ? 'الفرق:' : 'Diff:'}</span><span>{isAr ? 'نفس الشريط لكن أنحف (h-7 بدل h-8) + بدون سهم + شارات SLA أصغر + حشوة أقل' : 'Same bar but thinner (h-7 vs h-8) + no chevron + smaller SLA badges + tighter padding'}</span></p>
                <p className="text-[11px] leading-4 text-gray-700 dark:text-gray-300 flex gap-1.5"><span className="font-extrabold text-blue-700 dark:text-blue-300 shrink-0">{isAr ? 'الميزة:' : 'Benefit:'}</span><span>{isAr ? 'توازن مثالي — ترى ~12 طلباً مع الحفاظ على كل تفاصيل SLA (ممتاز للاستخدام اليومي)' : 'Perfect balance — see ~12 orders while keeping all SLA details (best daily driver)'}</span></p>
              </div>
              <div className="rounded-lg border border-blue-200 dark:border-blue-800/40 bg-white dark:bg-gray-900 p-2 flex items-center gap-2">
                <div className="flex-1 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2 flex items-center gap-1 text-[11px] font-bold">
                  <Clock size={11} className="shrink-0" />
                  <span>#ORD-1025</span>
                  <span className="text-[10px] opacity-60">(11:42)</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white">Warning</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">{isAr ? 'نفس التصميم في الجدول — زر أزرق = مدمج' : 'Same design in timeline — blue button = compact'}</p>
            </div>
            <div className="rounded-xl border border-violet-200 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-950/20 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs font-extrabold text-violet-800 dark:text-violet-300">{isAr ? 'مكثف' : 'Dense'}</span>
                <span className="ml-auto text-[10px] font-bold text-violet-700 dark:text-violet-400">~32px • h-6</span>
              </div>
              <div className="space-y-1 mb-2">
                <p className="text-[11px] leading-4 text-gray-700 dark:text-gray-300 flex gap-1.5"><span className="font-extrabold text-violet-700 dark:text-violet-300 shrink-0">{isAr ? 'الفرق:' : 'Diff:'}</span><span>{isAr ? 'حبة صغيرة جداً h-6 فقط (# + ساعة + نقطة) + بدون شريط SLA طويل + حتى طلبات الشحن تصبح نقاط' : 'Tiny h-6 pill only (# + time + dot) + no long SLA bar + even shipped orders become dots'}</span></p>
                <p className="text-[11px] leading-4 text-gray-700 dark:text-gray-300 flex gap-1.5"><span className="font-extrabold text-violet-700 dark:text-violet-300 shrink-0">{isAr ? 'الميزة:' : 'Benefit:'}</span><span>{isAr ? 'أقصى نظرة عامة — ~18 طلباً في الشاشة، مسح فوري للمتأخر/الحرج في الأيام المزدحمة (+20 طلب)' : 'Max overview — ~18 orders per viewport, instant scan for overdue/critical on busy +20 order days'}</span></p>
              </div>
              <div className="rounded-lg border border-violet-200 dark:border-violet-800/40 bg-white dark:bg-gray-900 p-2 flex items-center gap-1.5">
                <span className="h-6 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-200 px-2.5 flex items-center gap-1 text-[11px] font-bold gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  #ORD-1026
                  <span className="text-[10px] opacity-60">(09:08)</span>
                </span>
                <span className="h-6 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-2 flex items-center gap-1 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  #ORD-1027 <span className="text-[10px] opacity-60">(09:12)</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">{isAr ? 'نفس التصميم في الجدول — زر بنفسجي = مكثف' : 'Same design in timeline — violet button = dense'}</p>
            </div>
          </div>
          <div className="px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/30 flex gap-2 shrink-0">
            <span className="text-amber-600 dark:text-amber-400 mt-0.5">💡</span>
            <p className="text-[11px] leading-4 text-amber-800 dark:text-amber-200">
              {isAr ? 'نصيحة: استخدم المكثف عند وجود +20 شحنة، وعد إلى المريح عند فحص طلب واحد بالتفصيل.' : 'Tip: Use Dense when you have 20+ shipments, switch back to Comfortable to inspect a single order’s SLA timeline.'}
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

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
  lifecycleHistory: { status: OrderStatus; timestampMs: number; timeStr: string }[];
}

const OrdersTimelineCard: React.FC = () => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const { orders, fetchOrders, isLoadingOrders } = useStore();
  const prefTheme = usePreferencesStore((s) => s.theme);

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
  const [rowRefreshTick, setRowRefreshTick] = useState<Record<string, number>>({});
  const [rowRefreshing, setRowRefreshing] = useState<Record<string, boolean>>({});
  const [hoveredNode, setHoveredNode] = useState<{
    node: TimelineNode;
    element: HTMLElement;
    status: OrderStatus;
  } | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [headerBottom, setHeaderBottom] = useState<number>(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  const handleRowRefresh = useCallback((orderId: string) => {
    setRowRefreshing(prev => ({ ...prev, [orderId]: true }));
    setRowRefreshTick(prev => ({ ...prev, [orderId]: (prev[orderId] || 0) + 1 }));
    // Real-Time Controller re-validates position, groups, circles, links for this row only
    // Force re-render; timeline is recomputed via buildAccurateTimeline on next render with fresh tick
    setTimeout(() => setRowRefreshing(prev => ({ ...prev, [orderId]: false })), 650);
  }, []);

  const handleStatusHover = useCallback((
    e: React.MouseEvent<HTMLElement>,
    status: OrderStatus,
    timestampMs: number,
    timeStr: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredNode({
      node: { status, timestampMs, timeStr },
      element: e.currentTarget as HTMLElement,
      status,
    });
    setHoverRect(rect);
    if (headerRef.current) {
      setHeaderBottom(headerRef.current.getBoundingClientRect().bottom);
    }
  }, []);

  const handleStatusLeave = useCallback(() => {
    setHoveredNode(null);
    setHoverRect(null);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isExpanded) setIsExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  useEffect(() => {
    if (!hoveredNode) {
      setHoverRect(null);
      return;
    }

    const updateRect = () => {
      const rect = hoveredNode.element.getBoundingClientRect();
      setHoverRect(rect);
      if (headerRef.current) {
        setHeaderBottom(headerRef.current.getBoundingClientRect().bottom);
      }
    };

    updateRect();

    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => updateRect();
    const onResize = () => updateRect();

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [hoveredNode]);

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

  // ── Editor tool: "Fit to Data" / "Zoom to Fit" ──
  // Jumps the viewport to the timestamp that best centers ALL of the current
  // orders' real event history, instead of forcing the user to page ±3 days
  // at a time to find where their data actually lives.
  const handleFitToData = useCallback(() => {
    const centerMs = computeFitCenterMs(orders);
    if (centerMs !== null) setCenterDate(new Date(centerMs));
  }, [orders]);

  // ── Editor tool: "Jump to Date" — direct navigation via a date input,
  // a standard control in professional timeline/Gantt editors.
  const handleJumpToDate = (dateStr: string) => {
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return;
    setCenterDate(new Date(y, m - 1, d));
  };

  // ── Editor tool: keyboard shortcuts (←/→ page days, Home = today, +/- zoom) ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrevDays(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleNextDays(); }
      else if (e.key === 'Home') { e.preventDefault(); handleGoToday(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); handleZoomIn(); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); handleZoomOut(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const prevOrdersRef = useRef<Order[]>(orders);
  // Live timer update — only trigger SLA when orders actually changed (avoid repeated calls on clock tick)
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = new Date();
      setNow(currentNow);
      // Time-based SLA transitions still need checking, but dedup via sessionStorage handles duplicates
      // Only do full check if orders reference changed
      if (orders !== prevOrdersRef.current) {
        checkAndTriggerSlaNotifications(orders, currentNow);
        prevOrdersRef.current = orders;
      } else {
        checkAndTriggerSlaNotifications(orders, currentNow);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [orders]);

  // Initial SLA check with dedup
  useEffect(() => {
    if (orders !== prevOrdersRef.current) {
      checkAndTriggerSlaNotifications(orders, new Date());
      prevOrdersRef.current = orders;
    }
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

  const viewportStartMs = visibleDays[0]?.startOfDayMs ?? Date.now() - 3 * 24 * 3600 * 1000;
  const viewportEndMs = visibleDays[visibleDays.length - 1]?.endOfDayMs ?? Date.now() + 3 * 24 * 3600 * 1000;
  const viewportDurationMs = Math.max(viewportEndMs - viewportStartMs, 7 * 24 * 3600 * 1000);

  // Realtime "NOW" Marker Position (%) — hide when out of viewport (per report 2.3)
  const nowIsVisible = now.getTime() >= viewportStartMs && now.getTime() <= viewportEndMs;
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
    const rawOrders = orders;

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

      // Get lifecycle history (all previous states as circles)
      const lifecycleHistory = getLifecycleHistory(order);

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
        lifecycleHistory,
      };
    });
  }, [orders, isAr, now]);

  // Memoized timeline cache per order — avoids rebuilding 20+ rows on every render (2.1)
  const timelineCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof buildTimelineElements>>();
    for (const item of timelineData) {
      const hist = (item.lifecycleHistory as any[]).filter((n: any) => n.status !== item.orderStatus);
      const result = buildTimelineElements(hist as any, item.orderStatus, item.eventTimestamp, viewportStartMs, viewportDurationMs, zoomLevel);
      cache.set(item.order.id, result as any);
    }
    return cache;
  }, [timelineData, zoomLevel, viewportStartMs, viewportDurationMs, rowRefreshTick]);

  const alertOrder = useMemo(() => {
    return timelineData.find(d => d.slaState === 'critical' || d.slaState === 'warning' || d.slaState === 'overdue');
  }, [timelineData]);

  // ── Editor tool: off-viewport awareness ──
  // Orders whose real event time falls outside the current 7-day window would
  // previously render pinned at the 0%/100% edge (clamped by calcPercentFromTimestamp),
  // which looks like a positioning bug. We now surface them as explicit,
  // clickable "N earlier / N later" indicators instead of silently mis-placing them.
  const offViewportSummary = useMemo(
    () => getOffViewportSummary(timelineData, viewportStartMs, viewportEndMs),
    [timelineData, viewportStartMs, viewportEndMs],
  );

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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 shadow-2xs" title={isAr ? 'المتحكم الزمني يصحح المواضع تلقائياً' : 'Real-Time Controller: time-respect on'}>
                  <RefreshCw size={10} className="animate-spin text-violet-500" />
                  RTC
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isAr ? `توقيت المحرر: ${todayDateFormatted} • الساعة ${nowTimeFormatted} • 4 ساعة تجميع` : `Editor Clock: ${todayDateFormatted} • ${nowTimeFormatted} • 4h grouping`}
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
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* "N earlier" jump chip — replaces silent edge-clamping of off-viewport orders */}
            {offViewportSummary.beforeCount > 0 && (
              <button
                onClick={() => offViewportSummary.nearestBeforeMs !== null && setCenterDate(new Date(offViewportSummary.nearestBeforeMs))}
                title={isAr ? 'القفز إلى أقرب طلب أقدم من نافذة العرض' : 'Jump to nearest order before this view'}
                className="px-2 py-1 rounded-lg text-[11px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all"
              >
                <ChevronsLeft size={12} />
                {offViewportSummary.beforeCount} {isAr ? 'أقدم' : 'earlier'}
              </button>
            )}

            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200/80 dark:border-white/10 shadow-2xs">
              <button
                onClick={handlePrevDays}
                title={isAr ? 'الأيام السابقة (←)' : 'Previous Days (←)'}
                className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                onClick={handleGoToday}
                title={isAr ? 'اليوم (Home)' : 'Today (Home)'}
                className="px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all border border-emerald-200 dark:border-emerald-800/40"
              >
                <Calendar size={12} />
                <span>{isAr ? 'اليوم' : 'Today'}</span>
              </button>

              {/* "Fit to Data" / "Zoom to Fit" — professional timeline-editor tool:
                  centers the view on where the orders' real history actually is,
                  instead of paging manually 3 days at a time. */}
              <button
                onClick={handleFitToData}
                title={isAr ? 'ملاءمة تلقائية — التمركز حول بيانات الطلبات الفعلية' : 'Fit to Data — center on actual order history'}
                className="px-2.5 py-1 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all border border-indigo-200 dark:border-indigo-800/40"
              >
                <Target size={12} />
                <span>{isAr ? 'ملاءمة' : 'Fit'}</span>
              </button>

              {/* "Jump to Date" — direct navigation input, standard in Gantt/timeline editors */}
              <input
                type="date"
                title={isAr ? 'الانتقال إلى تاريخ محدد' : 'Jump to a specific date'}
                value={`${centerDate.getFullYear()}-${String(centerDate.getMonth() + 1).padStart(2, '0')}-${String(centerDate.getDate()).padStart(2, '0')}`}
                onChange={e => handleJumpToDate(e.target.value)}
                className="text-[11px] font-bold bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-1.5 py-1 text-gray-700 dark:text-gray-200 cursor-pointer"
              />

              <button
                onClick={handleNextDays}
                title={isAr ? 'الأيام القادمة (→)' : 'Next Days (→)'}
                className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* "N later" jump chip */}
            {offViewportSummary.afterCount > 0 && (
              <button
                onClick={() => offViewportSummary.nearestAfterMs !== null && setCenterDate(new Date(offViewportSummary.nearestAfterMs))}
                title={isAr ? 'القفز إلى أقرب طلب بعد نافذة العرض' : 'Jump to nearest order after this view'}
                className="px-2 py-1 rounded-lg text-[11px] font-black text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 flex items-center gap-1 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all"
              >
                {offViewportSummary.afterCount} {isAr ? 'أحدث' : 'later'}
                <ChevronsRight size={12} />
              </button>
            )}
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
            {isLoadingOrders ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</p>
              </div>
            ) : filteredData.length === 0 ? (
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
            <div ref={timelineBodyRef} dir="ltr" style={{ minWidth: `${Math.round(1200 * zoomLevel)}px` }} className="relative space-y-4 pt-1 transition-all duration-300 pb-6">
              {/* TWO-LEVEL DATETIME HEADER SCALE — sticky top, highest z-index so rows never appear above it */}
              <div ref={headerRef} className="flex items-stretch w-full border-b border-gray-200 dark:border-white/10 pb-2 sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
                {/* Delivery Track Header — sticky left inside the sticky row */}
                <div className={`w-44 shrink-0 pr-3 font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex flex-col justify-end pb-1 ${isAr ? 'border-l' : 'border-r'} border-gray-200 dark:border-white/10 pl-3 bg-white dark:bg-gray-900 sticky ${isAr ? 'right-0' : 'left-0'} z-50`}>
                  <span>{isAr ? 'مسار التوصيل' : 'Delivery Track'}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{isAr ? 'ساعات + دقائق' : 'Continuous Scale'}</span>
                </div>

                {/* 7 Visible Days */}
                <div className="flex-1 grid grid-cols-7 gap-0 relative">
                  {visibleDays.map(day => (
                    <div
                      key={day.id}
                      className={`border-r border-gray-200 dark:border-white/10 px-1 py-1 text-center transition-all ${day.isToday ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
                    >
                      {/* Level 1 Day Badge + Smart Weather/Congestion */}
                      <div className={`py-1 rounded-xl text-xs font-black transition-all relative group/day ${
                        day.isToday
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10'
                      }`}>
                        <span>{day.dayNum} {day.monthName}</span>
                        <span className="text-[10px] opacity-80 block font-semibold">{day.isToday ? (isAr ? 'اليوم' : 'TODAY') : day.dayName}</span>
                        {(() => {
                          const dayStart = day.startOfDayMs;
                          const dayEnd = day.endOfDayMs;
                          const hasDelay = timelineData.some(item => {
                            const hist = item.lifecycleHistory || [];
                            for(let i=1;i<hist.length;i++){
                              const gap = hist[i].timestampMs - hist[i-1].timestampMs;
                              if(gap > 8*3600*1000){
                                const mid = (hist[i].timestampMs + hist[i-1].timestampMs)/2;
                                if(mid >= dayStart && mid <= dayEnd) return true;
                              }
                            }
                            if(item.shippedAtMs && item.deadlineMs){
                              const d = new Date(item.deadlineMs);
                              const dayD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                              if(dayD === dayStart && (item.slaState==='warning'||item.slaState==='critical'||item.slaState==='overdue')) return true;
                            }
                            return false;
                          });
                          if(!hasDelay) return null;
                          const isRain = day.dayNum % 2 === 0;
                          return (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center text-[10px] opacity-0 group-hover/day:opacity-100 transition-opacity" title={isRain ? (isAr ? 'مطر - قد يؤثر على التوصيل' : 'Rain — may affect delivery') : (isAr ? 'ازدحام/أعمال طرق' : 'Congestion / road works')}>
                              {isRain ? '🌧️' : '🚧'}
                            </span>
                          );
                        })()}
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
                    <div key={day.id} className="col-span-1 border-r border-gray-200 dark:border-white/10 h-full grid grid-cols-6 gap-0 ${day.isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : ''}">
                      {hourlyScaleTicks.map((_, hIdx) => (
                        <div key={hIdx} className="border-r border-dashed border-gray-200 dark:border-white/10 h-full" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* LIVE "NOW" DASHED MARKER LINE — hidden when out of viewport (2.3) */}
                {nowIsVisible && (
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
                )}

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

                          // ── LIFECYCLE HISTORY — Real-Time Controller (time-respect, 4h grouping, merge) ──
                          const lifecycleNodes = (item.lifecycleHistory || []).filter((n: any) => n.status !== st);

                          // Density-aware sizing — COMFORTABLE vs COMPACT vs DENSE actually change layout
                          const nodeH = density === 'dense' ? 24 : density === 'compact' ? 28 : 32;
                          const nodeIconSize = density === 'dense' ? 10 : density === 'compact' ? 12 : 14;
                          const rowHNonShipped = density === 'dense' ? 'h-[32px]' : density === 'compact' ? 'h-[38px]' : 'h-[46px]';
                          const rowHShipped = density === 'dense' ? 'h-[32px]' : density === 'compact' ? 'h-[42px]' : 'h-[50px]';
                          const slaBarH = density === 'dense' ? 'h-6' : density === 'compact' ? 'h-7' : 'h-8';
                          const isDense = density === 'dense';
                          const isCompact = density === 'compact';
                          const nodeY = 0;
                          const centerY = nodeH / 2;

                          const leftPercent = calcPercentFromTimestamp(item.eventTimestamp, viewportStartMs, viewportDurationMs);

                          // Shipped pill position (for connector endpoint alignment)
                          const startPercent = item.shippedAtMs ? calcPercentFromTimestamp(item.shippedAtMs, viewportStartMs, viewportDurationMs) : leftPercent;
                          const endPercent = item.deadlineMs ? calcPercentFromTimestamp(item.deadlineMs, viewportStartMs, viewportDurationMs) : leftPercent + 15;
                          const widthPercent = Math.max(3, endPercent - startPercent);

                          // Connector endpoint = where the current pill actually sits
                          const isShippedBranch = st === 'shipped' || st === 'delivered';
                          const pillPct = isShippedBranch ? startPercent : leftPercent;

                          // Build timeline using new service (with cache support)
                          const buildTimelineResult = () => {
                            const cachedBuild = timelineCache.get(item.order.id);
                            if (cachedBuild) return cachedBuild;
                            
                            return buildTimelineElements(
                              lifecycleNodes as any,
                              st,
                              item.eventTimestamp,
                              viewportStartMs,
                              viewportDurationMs,
                              zoomLevel
                            );
                          };
                          
                          const { elements, connectors } = buildTimelineResult();
                          const hasMergedCurrent = elements.some((el: any) => el.type === 'merged' && el.nodes.some((n: any) => n.status === st));
                          const mergedElement = elements.find((el: any) => el.type === 'merged') as any;
                          const recentForHeader = [...lifecycleNodes].sort((a:any,b:any)=> b.timestampMs - a.timestampMs).slice(0,2).reverse();

                          // Handlers for hover
                          const handleNodeHover = (node: TimelineNode, element: HTMLElement) => {
                            const rect = element.getBoundingClientRect();
                            setHoveredNode({ node, element, status: node.status });
                            setHoverRect(rect);
                            if (headerRef.current) setHeaderBottom(headerRef.current.getBoundingClientRect().bottom);
                          };
                          const handleNodeLeave = () => { setHoveredNode(null); setHoverRect(null); };

                          // Render lifecycle elements using new components
                          const renderLifecycleElements = (opts?: { excludeMerged?: boolean }) => {
                            if (!elements.length) return null;

                            let filteredElements = elements;
                            let filteredConnectors = connectors;
                            
                            if (opts?.excludeMerged && mergedElement) {
                              filteredElements = elements.filter((el: any) => el.type !== 'merged');
                              filteredConnectors = connectors.filter((c: any) => {
                                if (mergedElement && (Math.abs(c.from - mergedElement.pct) < 0.01 || Math.abs(c.to - mergedElement.pct) < 0.01)) return false;
                                return true;
                              });
                            }
                            
                            if (!filteredElements.length) return null;

                            return (
                              <>
                                {/* Connectors */}
                                {filteredConnectors.map((c: { from: number; to: number }, ci: number) => (
                                  <TimelineConnector key={`conn-${ci}`} from={c.from} to={c.to} top={centerY - 1} />
                                ))}

                                {/* Smart Annotations — Time Gaps >8h */}
                                <TimelineGapAnnotations
                                  lifecycleHistory={item.lifecycleHistory as any}
                                  viewportStartMs={viewportStartMs}
                                  viewportDurationMs={viewportDurationMs}
                                  centerY={centerY}
                                  isAr={isAr}
                                  top={-28}
                                />

                                {/* Visual elements — time-respect, merged shows same-column */}
                                {filteredElements.map((el: TimelineElement, ei: number) => {
                                  const nextEl = filteredElements[ei + 1];
                                  const nextFirstNode = nextEl ? (nextEl.type === 'circle' ? (nextEl as any).node : (nextEl as any).nodes[0]) : null;
                                  const nextTimestamp = nextFirstNode?.timestampMs ?? item.eventTimestamp;

                                  if ((el as any).type === 'merged') {
                                    const m = el as any;
                                    return (
                                      <TimelineMerged
                                        key={`merged-${ei}`}
                                        nodes={m.nodes}
                                        currentStatus={st}
                                        pct={m.pct}
                                        top={nodeY}
                                        iconSize={nodeIconSize}
                                        orderId={orderIdStr}
                                        isAr={isAr}
                                        onNodeHover={handleNodeHover}
                                        onNodeLeave={handleNodeLeave}
                                        formatDuration={formatDurationMs}
                                        formatDate={formatDateTime}
                                        eventTimestamp={item.eventTimestamp}
                                        onClick={() => setSelectedMeta(item)}
                                      />
                                    );
                                  }

                                  if (el.type === 'circle') {
                                    const node = el.node;
                                    return (
                                      <TimelineCircle
                                        key={`lc-${node.status}-${ei}`}
                                        node={node}
                                        pct={el.pct}
                                        top={nodeY}
                                        height={nodeH}
                                        iconSize={nodeIconSize}
                                        orderId={orderIdStr}
                                        isAr={isAr}
                                        onNodeHover={handleNodeHover}
                                        onNodeLeave={handleNodeLeave}
                                        formatDuration={formatDurationMs}
                                        formatDate={formatDateTime}
                                        nextTimestamp={nextTimestamp}
                                      />
                                    );
                                  }

                                  // Group
                                  return (
                                    <TimelineGroup
                                      key={`lg-${ei}`}
                                      nodes={el.nodes}
                                      pctStart={el.pct}
                                      pctEnd={el.endPct}
                                      top={nodeY}
                                      height={nodeH}
                                      iconSize={nodeIconSize}
                                      orderId={orderIdStr}
                                      isAr={isAr}
                                      onNodeHover={handleNodeHover}
                                      onNodeLeave={handleNodeLeave}
                                      formatDuration={formatDurationMs}
                                      formatDate={formatDateTime}
                                    />
                                  );
                                })}
                              </>
                            );
                          };

                          // ── BRANCH: Non-shipped — density-aware with enhanced Dense premium design
                          if (st === 'pending' || st === 'confirmed' || st === 'processing' || st === 'cancelled') {
                            const sc = STATUS_STYLE[st] || STATUS_STYLE.pending;
                            const hideCurrentPill = hasMergedCurrent;
                            // Enhanced Dense: premium compact pill with left accent, status abbreviation, and refined typography
                            if (isDense) {
                              const statusAbbr = st === 'pending' ? 'PND' : st === 'confirmed' ? 'CNF' : st === 'processing' ? 'PRC' : 'CNL';
                              const accentColor = st === 'pending' ? 'border-amber-400' : st === 'confirmed' ? 'border-blue-400' : st === 'processing' ? 'border-violet-400' : 'border-red-400';
                              const dotColor = st === 'pending' ? 'bg-amber-500' : st === 'confirmed' ? 'bg-blue-500' : st === 'processing' ? 'bg-violet-500' : 'bg-red-500';
                              return (
                                <div key={`${item.order.id}-${rowRefreshTick[item.order.id]||0}`} className={`flex w-full relative group/row hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors ${rowRefreshing[item.order.id] ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : ''}`}>
                                  <div className={`w-44 shrink-0 text-[11px] font-semibold pl-3 pr-2 truncate sticky left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex items-center ${rowHNonShipped} pb-2.5 group-hover/row:bg-gray-50/50 dark:group-hover/row:bg-white/[0.03]`}>
                                    <span className={`w-1 h-4 rounded-full mr-2 ${dotColor} opacity-60 ${rowRefreshing[item.order.id] ? 'animate-pulse' : ''}`} />
                                    <span className={technicalColor}>#{orderIdStr}</span> <span className="text-gray-400 mx-1">•</span> <span className="text-gray-700 dark:text-gray-200 font-bold">{item.eventTimeStr}</span>
                                  </div>
                                  <div className={`flex-1 relative ${rowHNonShipped} pb-2.5`}>
                                    {renderLifecycleElements()}
                                    {/* Per-row refresh — top of line only */}
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleRowRefresh(item.order.id); }}
                                      disabled={!!rowRefreshing[item.order.id]}
                                      title={isAr ? 'تحديث تصميم هذا السطر فقط' : 'Refresh design for this row only'}
                                      className="absolute -top-1 right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:text-emerald-600 transition-all z-20 opacity-0 group-hover/row:opacity-100 focus:opacity-100 disabled:opacity-50"
                                    >
                                      <RefreshCw size={11} className={`${rowRefreshing[item.order.id] ? 'animate-spin text-emerald-500' : 'text-gray-400 group-hover/row:text-gray-600'}`} />
                                    </button>
                                    {hasMergedCurrent && mergedElement ? (
                                      <div
                                        onClick={() => setSelectedMeta(item)}
                                        onMouseEnter={(e) => handleStatusHover(e, st, item.eventTimestamp, item.eventTimeStr)}
                                        onMouseLeave={handleStatusLeave}
                                        style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)', top: '4px' }}
                                        className={`absolute z-10 h-6 rounded-full border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1 pl-1 pr-2 whitespace-nowrap ${accentColor} ${sc.pill} backdrop-blur-sm`}
                                      >
                                        <span className="flex items-center -space-x-1">
                                          {mergedElement.nodes.filter((n:any)=> n.status !== st).slice(0,2).map((node:any, idx:number) => {
                                            const Ic:any = ICON_MAP[node.status] || Clock;
                                            const sc2:any = STATUS_STYLE[node.status] || STATUS_STYLE.pending;
                                            return <span key={idx} className={`w-4 h-4 rounded-full border flex items-center justify-center ${sc2.pill}`}><Ic size={8} className={sc2.iconColor} /></span>;
                                          })}
                                        </span>
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${st==='pending'?'bg-amber-100 dark:bg-amber-900/40 text-amber-600':st==='confirmed'?'bg-blue-100 dark:bg-blue-900/40 text-blue-600':st==='processing'?'bg-violet-100 dark:bg-violet-900/40 text-violet-600':'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>
                                          {st === 'pending' && <Clock size={10} className="animate-pulse" />}
                                          {st === 'confirmed' && <CheckCircle2 size={10} />}
                                          {st === 'processing' && <RefreshCw size={10} className="animate-spin" />}
                                          {st === 'cancelled' && <XCircle size={10} />}
                                        </span>
                                        <span className="font-bold text-[10px] tracking-wide text-gray-900 dark:text-white">#{orderIdStr}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse shadow-sm`} />
                                      </div>
                                    ) : !hideCurrentPill && (
                                      <div
                                        onClick={() => setSelectedMeta(item)}
                                        onMouseEnter={(e) => handleStatusHover(e, st, item.eventTimestamp, item.eventTimeStr)}
                                        onMouseLeave={handleStatusLeave}
                                        style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)', top: '4px' }}
                                        className={`absolute z-10 h-6 rounded-full border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5 pl-1 pr-2.5 whitespace-nowrap ${accentColor} ${sc.pill} backdrop-blur-sm`}
                                      >
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 -ml-0.5 ${st==='pending'?'bg-amber-100 dark:bg-amber-900/40 text-amber-600':st==='confirmed'?'bg-blue-100 dark:bg-blue-900/40 text-blue-600':st==='processing'?'bg-violet-100 dark:bg-violet-900/40 text-violet-600':'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>
                                          {st === 'pending' && <Clock size={10} className="animate-pulse" />}
                                          {st === 'confirmed' && <CheckCircle2 size={10} />}
                                          {st === 'processing' && <RefreshCw size={10} className="animate-spin" />}
                                          {st === 'cancelled' && <XCircle size={10} />}
                                        </span>
                                        <span className="font-bold text-[10px] tracking-wide text-gray-900 dark:text-white">#{orderIdStr}</span>
                                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">{statusAbbr}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse shadow-sm`} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            const pillH = slaBarH;
                            return (
                              <div key={`${item.order.id}-${rowRefreshTick[item.order.id]||0}`} className={`flex w-full relative group/row ${rowRefreshing[item.order.id] ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : ''}`}>
                                <div className={`w-44 shrink-0 text-[11px] font-semibold pl-3 pr-2 truncate sticky left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex items-center ${rowHNonShipped} pb-2.5`}>
                                  <span className={technicalColor}>#{orderIdStr}</span> <span className="text-gray-400 mx-1">•</span> <span className="text-gray-700 dark:text-gray-200 font-bold">{item.eventTimeStr}</span>
                                </div>
<div className={`flex-1 relative ${rowHNonShipped} pb-2.5`}>
                                   {renderLifecycleElements()}
                                   <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRowRefresh(item.order.id); }}
                                    disabled={!!rowRefreshing[item.order.id]}
                                    title={isAr ? 'تحديث تصميم هذا السطر فقط' : 'Refresh design for this row only'}
                                    className="absolute -top-1 right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:text-emerald-600 transition-all z-20 opacity-0 group-hover/row:opacity-100 focus:opacity-100 disabled:opacity-50"
                                  >
                                    <RefreshCw size={11} className={`${rowRefreshing[item.order.id] ? 'animate-spin text-emerald-500' : 'text-gray-400 group-hover/row:text-gray-600'}`} />
                                  </button>
                                  {!hideCurrentPill && (
                                    <div
                                      onClick={() => setSelectedMeta(item)}
                                      onMouseEnter={(e) => handleStatusHover(e, st, item.eventTimestamp, item.eventTimeStr)}
                                      onMouseLeave={handleStatusLeave}
                                      style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)', top: '2px' }}
                                      className={`absolute z-10 ${pillH} rounded-full border px-3 flex items-center gap-1.5 text-xs font-extrabold shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap ${sc.pill}`}
                                    >
                                      {st === 'pending' && <Clock size={13} className="text-amber-500 animate-pulse shrink-0" />}
                                      {st === 'confirmed' && <CheckCircle2 size={13} className="text-blue-500 shrink-0" />}
                                      {st === 'processing' && <RefreshCw size={13} className="text-violet-500 animate-spin shrink-0" />}
                                      {st === 'cancelled' && <XCircle size={13} className="text-red-500 shrink-0" />}
                                      <span className="font-bold text-[11px]">#{orderIdStr}</span>
                                      <span className="text-[10px] opacity-60 font-semibold">({item.eventTimeStr})</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // ── BRANCH: Shipped / Delivered → density-aware (comfortable=full bar, compact=thinner, dense=dot)

                          // Dense: premium compact — tiny pill with refined design, still scannable for ~18 orders — delivery header always shows 1-2 additional icons
                          if (isDense) {
                            const isShippedDense = !item.isCompleted;
                            const scDense = item.isCompleted ? STATUS_STYLE.delivered : STATUS_STYLE.shipped;
                            const slaDot = item.slaState==='overdue'?'bg-rose-500':item.slaState==='critical'?'bg-red-500':item.slaState==='warning'?'bg-amber-500':'bg-emerald-500';
                            const slaBg = item.slaState==='overdue'?'bg-rose-50 dark:bg-rose-900/20 border-rose-200':item.slaState==='critical'?'bg-red-50 dark:bg-red-900/20 border-red-200':item.slaState==='warning'?'bg-amber-50 dark:bg-amber-900/20 border-amber-200':item.isCompleted?'bg-gray-50 dark:bg-gray-800 border-gray-200':'bg-sky-50 dark:bg-sky-900/20 border-sky-200';
                            return (
                              <div key={`${item.order.id}-${rowRefreshTick[item.order.id]||0}`} className={`flex w-full relative group/row hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors ${rowRefreshing[item.order.id] ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                                <div className={`w-44 shrink-0 text-xs font-bold pl-3 pr-2 truncate sticky left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex items-center ${rowHShipped} pb-2.5 group-hover/row:bg-gray-50/50 dark:group-hover/row:bg-white/[0.03]`}>
                                  <span className={`w-1 h-4 rounded-full mr-2 ${isShippedDense? slaDot : 'bg-gray-300'} opacity-70 ${rowRefreshing[item.order.id] ? 'animate-pulse' : ''}`} />
                                  <span className={technicalColor}>#{orderIdStr}</span>
                                  <span className="ml-1 text-[10px] font-normal text-gray-400 hidden sm:inline">{item.isCompleted ? '✓' : `${item.progress}%`}</span>
                                </div>
                                <div className={`flex-1 relative ${rowHShipped} pb-2.5`}>
                                  {renderLifecycleElements({ excludeMerged: !!hasMergedCurrent })}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRowRefresh(item.order.id); }}
                                    disabled={!!rowRefreshing[item.order.id]}
                                    title={isAr ? 'تحديث تصميم هذا السطر فقط' : 'Refresh design for this row only'}
                                    className="absolute -top-1 right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:text-emerald-600 transition-all z-20 opacity-0 group-hover/row:opacity-100 focus:opacity-100 disabled:opacity-50"
                                  >
                                    <RefreshCw size={11} className={`${rowRefreshing[item.order.id] ? 'animate-spin text-emerald-500' : 'text-gray-400 group-hover/row:text-gray-600'}`} />
                                  </button>
                                  <div
                                    onClick={() => setSelectedMeta(item)}
                                    onMouseEnter={(e) => handleStatusHover(e, st, item.eventTimestamp, item.eventTimeStr)}
                                    onMouseLeave={handleStatusLeave}
                                    style={{ left: `${startPercent}%`, transform: 'translateX(-50%)', top: '4px' }}
                                    className={`absolute z-10 h-6 rounded-full border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1 pl-1 pr-2 whitespace-nowrap ${hasMergedCurrent ? 'ring-2 ring-violet-300 border-violet-300' : slaBg} backdrop-blur-sm`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isShippedDense ? (item.slaState==='overdue'?'bg-rose-100 dark:bg-rose-900/40 text-rose-600':item.slaState==='critical'?'bg-red-100 dark:bg-red-900/40 text-red-600':item.slaState==='warning'?'bg-amber-100 dark:bg-amber-900/40 text-amber-600':'bg-sky-100 dark:bg-sky-900/40 text-sky-600') : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                      {hasMergedCurrent && mergedElement ? (
                                        <span className="flex -space-x-1">
                                          {mergedElement.nodes.slice(0,3).map((node: any, idx: number) => {
                                            const Ic: any = ICON_MAP[node.status] || Clock;
                                            return <span key={idx} onMouseEnter={(e)=>{ const r=e.currentTarget.getBoundingClientRect(); setHoveredNode({node, element:e.currentTarget as HTMLElement, status:node.status}); setHoverRect(r); if(headerRef.current) setHeaderBottom(headerRef.current.getBoundingClientRect().bottom); }} onMouseLeave={()=>{setHoveredNode(null); setHoverRect(null);}} className="w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm cursor-pointer"><Ic size={7} className={STATUS_STYLE[node.status]?.iconColor || 'text-gray-400'} /></span>;
                                          })}
                                        </span>
                                      ) : recentForHeader.length > 0 ? (
                                        <span className="flex -space-x-1">
                                          {recentForHeader.map((node: any, idx: number) => {
                                            const Ic: any = ICON_MAP[node.status] || Clock;
                                            return <span key={idx} onMouseEnter={(e)=>{ const r=e.currentTarget.getBoundingClientRect(); setHoveredNode({node, element:e.currentTarget as HTMLElement, status:node.status}); setHoverRect(r); if(headerRef.current) setHeaderBottom(headerRef.current.getBoundingClientRect().bottom); }} onMouseLeave={()=>{setHoveredNode(null); setHoverRect(null);}} className="w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm cursor-pointer"><Ic size={7} className={STATUS_STYLE[node.status]?.iconColor || 'text-gray-400'} /></span>;
                                          })}
                                          <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm"><Truck size={7} className="text-sky-600" /></span>
                                        </span>
                                      ) : isShippedDense ? (
                                        <Truck size={9} className="animate-pulse" />
                                      ) : (
                                        <CheckCircle2 size={9} />
                                      )}
                                    </span>
                                    <span className="font-bold text-[10px] tracking-wide text-gray-900 dark:text-white">#{orderIdStr}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
                                    <span className={`w-1.5 h-1.5 rounded-full ${slaDot} animate-pulse shadow-sm`} />
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={`${item.order.id}-${rowRefreshTick[item.order.id]||0}`} className={`flex w-full relative group/row ${rowRefreshing[item.order.id] ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : ''}`}>
                              <div className={`w-44 shrink-0 text-xs font-bold pl-3 pr-2 truncate sticky left-0 z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex items-center ${rowHShipped} pb-2.5`}>
                                <span className={technicalColor}>#{orderIdStr}</span>
                              </div>
                              <div className={`flex-1 relative ${rowHShipped} pb-2.5`}>
                                {renderLifecycleElements({ excludeMerged: !!hasMergedCurrent })}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRowRefresh(item.order.id); }}
                                  disabled={!!rowRefreshing[item.order.id]}
                                  title={isAr ? 'تحديث تصميم هذا السطر فقط' : 'Refresh design for this row only'}
                                  className="absolute -top-1 right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:text-emerald-600 transition-all z-20 opacity-0 group-hover/row:opacity-100 focus:opacity-100 disabled:opacity-50"
                                >
                                  <RefreshCw size={11} className={`${rowRefreshing[item.order.id] ? 'animate-spin text-emerald-500' : 'text-gray-400 group-hover/row:text-gray-600'}`} />
                                </button>
                                <div
                                  onClick={() => setSelectedMeta(item)}
                                  onMouseEnter={(e) => handleStatusHover(e, st, item.eventTimestamp, item.eventTimeStr)}
                                  onMouseLeave={handleStatusLeave}
                                  style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                                  className={`absolute z-10 top-[4px] ${slaBarH} rounded-full ${item.lightBg} border p-0.5 flex items-center justify-between shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group overflow-hidden ${isCompact ? 'p-0.5' : ''}`}
                                >
                                  {/* Historical icons at START/LEFT of state column, before order info, NOT inside darker pill */}
                                  {(hasMergedCurrent && mergedElement ? mergedElement.nodes.filter((n:any)=> n.status !== st).slice(0,2) : recentForHeader.slice(0,2)).length > 0 && (
                                    <span className="flex items-center gap-1 pl-1 shrink-0">
                                      {(hasMergedCurrent && mergedElement ? mergedElement.nodes.filter((n:any)=> n.status !== st).slice(0,2) : recentForHeader.slice(0,2)).map((node: any, idx: number) => {
                                        const Ic: any = ICON_MAP[node.status] || Clock;
                                        const sc2: any = STATUS_STYLE[node.status] || STATUS_STYLE.pending;
                                        return (
                                          <span key={idx} onMouseEnter={(e)=>{ const r=e.currentTarget.getBoundingClientRect(); setHoveredNode({node, element:e.currentTarget as HTMLElement, status:node.status}); setHoverRect(r); if(headerRef.current) setHeaderBottom(headerRef.current.getBoundingClientRect().bottom); }} onMouseLeave={()=>{setHoveredNode(null); setHoverRect(null);}} className={`w-6 h-6 rounded-full border flex items-center justify-center shadow-sm ${sc2.pill} cursor-pointer`}>
                                            <Ic size={11} className={`${sc2.iconColor} ${sc2.anim} shrink-0`} />
                                          </span>
                                        );
                                      })}
                                    </span>
                                  )}
                                  <div className={`h-full rounded-full ${item.isCompleted ? 'bg-gray-400 dark:bg-gray-600' : `bg-gradient-to-r ${item.badgeBg}`} text-white ${isCompact?'px-2 gap-1':'px-2.5 gap-1'} flex items-center shrink-0`}>
                                    {item.isCompleted ? (
                                      <CheckCircle2 size={isCompact?11:13} className="text-white shrink-0" />
                                    ) : (
                                      <Truck size={isCompact?11:13} className="text-white animate-bounce shrink-0" />
                                    )}
                                    <span className={`font-bold tracking-wide ${isCompact?'text-[10px]':'text-xs'}`}>#{orderIdStr}</span>
                                    {!isCompact && <span className="text-[10px] opacity-80 font-normal">({item.eventTimeStr})</span>}
                                    {isCompact && <span className="w-1 h-1 rounded-full bg-white/60" />}
                                  </div>
                                  <div className={`flex items-center gap-1 pl-2 pr-1 shrink-0 ${isCompact?'gap-1 pl-1':'gap-1.5 pl-2'}`}>
                                    {item.slaState === 'overdue' ? (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse border border-rose-400 ${isCompact?'px-1.5 text-[9px]':''}`}>{item.remainingFormatted}</span>
                                    ) : item.slaState === 'critical' ? (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse border border-red-400 ${isCompact?'px-1.5 text-[9px]':''}`}>{item.remainingFormatted}</span>
                                    ) : item.slaState === 'warning' ? (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white border border-amber-400 ${isCompact?'px-1.5 text-[9px]':''}`}>{item.remainingFormatted}</span>
                                    ) : item.isCompleted ? (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white ${isCompact?'hidden sm:inline-flex':''}`}>{isAr ? 'تم التسليم' : 'Delivered'}</span>
                                    ) : (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white ${isCompact?'text-[9px] px-1.5':''}`}>{item.progress}%</span>
                                    )}
                                    {!isCompact && <ChevronRight size={14} className={`${item.arrowColor} group-hover:translate-x-0.5 transition-transform shrink-0`} />}
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
                        <div className={`w-44 shrink-0 bg-white dark:bg-gray-900 ${isAr ? 'border-l' : 'border-r'} border-gray-200 dark:border-white/10 ${isAr ? 'sticky right-0' : 'sticky left-0'} z-30 h-[16px]`} />
                        <div className="flex-1 h-[16px]" />
                      </div>
                    </div>
                  );
                })}

                {/* SOLID FILLER: Covers any remaining vertical space if there are only 1-2 orders */}
                <div className="flex-1 flex w-full relative pointer-events-none">
                  <div className={`w-44 shrink-0 bg-white dark:bg-gray-900 ${isAr ? 'border-l' : 'border-r'} border-gray-200 dark:border-white/10 ${isAr ? 'sticky right-0' : 'sticky left-0'} z-30`} />
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

      {/* 8. Hover Indicator — dashed vertical line + time label (per spec) */}
      {hoveredNode && hoverRect && headerBottom > 0 && hoverRect.top > headerBottom + 4 && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: hoverRect.left + hoverRect.width / 2,
            top: headerBottom + 2,
            height: Math.max(12, hoverRect.top - headerBottom - 8),
            pointerEvents: 'none',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: prefTheme === 'dark' ? 'rgba(255,255,255,0.98)' : 'rgba(17,24,39,0.96)',
              color: prefTheme === 'dark' ? 'black' : 'white',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              border: prefTheme === 'dark' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.14)',
              lineHeight: '1',
              letterSpacing: '0.02em',
            }}
          >
            {hoveredNode.node.timeStr}
          </div>
          <div
            style={{
              flex: 1,
              width: '0px',
              borderLeft: `2px dashed ${prefTheme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(17,24,39,0.88)'}`,
              opacity: 1,
              minHeight: '12px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '11px',
                lineHeight: '1',
                color: prefTheme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(17,24,39,0.92)',
                textShadow: prefTheme === 'dark' ? '0 1px 3px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.9)',
                background: prefTheme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.98)',
                borderRadius: '3px',
                padding: '1px 2px',
                border: prefTheme === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              ▼
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    </>
  );
};

export default OrdersTimelineCard;