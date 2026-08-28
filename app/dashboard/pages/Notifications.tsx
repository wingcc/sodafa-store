'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  Check,
  X,
  Clock,
  Star,
  ShoppingBag,
  Package,
  CreditCard,
  Truck,
  Gift,
  Info,
  User,
  TrendingUp,
  ShieldAlert,
  MessageSquare,
  Award,
  Calendar,
  Headphones,
  BarChart3,
  UsersRound,
  Megaphone,
  Plus,
  AlertCircle,
  BellRing,
  BellOff,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
  CheckCheck,
  Search,
  Settings,
  AlertTriangle,
  ShoppingCart,
  Tag,
  RefreshCw,
  CheckCircle2,
  Cog,
  PackageCheck,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';
import { useStore } from '../store/useStore';
import type { Notification, NotificationType, NotificationPriority, PageSection } from '../types';

// ── Canonical type mapping (legacy aliases) ───────────────────────────
const CANONICAL_TYPE: Record<string, NotificationType> = {
  stock: 'inventory',
  customer: 'social',
};

function canonical(t: string): NotificationType {
  return (CANONICAL_TYPE[t] ?? t) as NotificationType;
}

// ── Visual helpers (single source of truth — must stay in sync with notificationVisuals.tsx) ─
// Order type has 2 visuals: new-order (ShoppingBag/indigo) vs status-change (per-status icon/color)
// Detection via metadata.status / title / message so no DB migration needed.

function parseMetaLocal(meta: any): any {
  if (!meta) return null;
  if (typeof meta === 'string') { try { return JSON.parse(meta); } catch { return null; } }
  return meta;
}
function isOrderStatusChange(type: string, notification?: any): boolean {
  const c = canonical(type);
  if (c !== 'order' || !notification) return false;
  const meta = parseMetaLocal((notification as any).metadata) ?? notification;
  const title = (notification as any).title ?? '';
  const message = (notification as any).message ?? '';
  if (meta?.status && typeof meta.status === 'string' && meta.status.length > 0) return true;
  if ((meta as any)?.kind === 'status_change') return true;
  if (typeof title === 'string' && /updated|cancelled|delivered|shipped|processing|confirmed|refunded/i.test(title)) return true;
  if (typeof message === 'string' && /status changed/i.test(message)) return true;
  return false;
}
function getOrderStatusValue(notification?: any): string {
  if (!notification) return '';
  const meta = parseMetaLocal((notification as any).metadata) ?? notification;
  const raw = meta?.status ?? (notification as any).status ?? '';
  if (typeof raw === 'string' && raw.length > 0) return raw.toLowerCase();
  const text = `${(notification as any).title ?? ''} ${(notification as any).message ?? ''}`;
  const m = text.match(/\b(pending|confirmed|processing|shipped|delivered|cancelled|refunded)\b/i);
  return m ? m[1].toLowerCase() : '';
}

function getTypeIcon(type: string, size = 18, notification?: any) {
  const c = canonical(type);
  if (c === 'order' && isOrderStatusChange(type, notification)) {
    const status = getOrderStatusValue(notification);
    const perStatus: Record<string, React.ReactNode> = {
      pending: <Clock size={size} />,
      confirmed: <CheckCircle2 size={size} />,
      processing: <Cog size={size} />,
      shipped: <Truck size={size} />,
      delivered: <PackageCheck size={size} />,
      cancelled: <XCircle size={size} />,
      refunded: <RotateCcw size={size} />,
    };
    if (status && perStatus[status]) return perStatus[status];
    return <RefreshCw size={size} />;
  }
  const map: Record<string, React.ReactNode> = {
    order: <ShoppingBag size={size} />,
    review: <Star size={size} />,
    product: <Package size={size} />,
    payment: <CreditCard size={size} />,
    shipping: <Truck size={size} />,
    promotion: <Gift size={size} />,
    system: <Info size={size} />,
    social: <User size={size} />,
    inventory: <TrendingUp size={size} />,
    security: <ShieldAlert size={size} />,
    account: <Settings size={size} />,
    message: <MessageSquare size={size} />,
    achievement: <Award size={size} />,
    reminder: <Calendar size={size} />,
    subscription: <Bell size={size} />,
    support: <Headphones size={size} />,
    analytics: <BarChart3 size={size} />,
    team: <UsersRound size={size} />,
    event: <Megaphone size={size} />,
    custom: <Plus size={size} />,
    stock: <TrendingUp size={size} />,
    customer: <User size={size} />,
  };
  return map[c] ?? map[type] ?? <Bell size={size} />;
}

function getTypeClasses(type: string, notification?: any) {
  const c = canonical(type);
  if (c === 'order' && isOrderStatusChange(type, notification)) {
    const status = getOrderStatusValue(notification);
    const perStatus: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600 border-amber-200',
      confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
      processing: 'bg-violet-50 text-violet-600 border-violet-200',
      shipped: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      cancelled: 'bg-red-50 text-red-600 border-red-200',
      refunded: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    if (status && perStatus[status]) return perStatus[status];
    return 'bg-indigo-50 text-indigo-600 border-indigo-200';
  }
  const map: Record<string, string> = {
    order: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    review: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    product: 'bg-blue-50 text-blue-600 border-blue-200',
    payment: 'bg-green-50 text-green-600 border-green-200',
    shipping: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    promotion: 'bg-pink-50 text-pink-600 border-pink-200',
    system: 'bg-gray-50 text-gray-600 border-gray-200',
    social: 'bg-purple-50 text-purple-600 border-purple-200',
    inventory: 'bg-orange-50 text-orange-600 border-orange-200',
    security: 'bg-red-50 text-red-600 border-red-200',
    account: 'bg-violet-50 text-violet-600 border-violet-200',
    message: 'bg-sky-50 text-sky-600 border-sky-200',
    achievement: 'bg-amber-50 text-amber-600 border-amber-200',
    reminder: 'bg-violet-50 text-violet-600 border-violet-200',
    subscription: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    support: 'bg-blue-50 text-blue-600 border-blue-200',
    analytics: 'bg-violet-50 text-violet-600 border-violet-200',
    team: 'bg-teal-50 text-teal-600 border-teal-200',
    event: 'bg-rose-50 text-rose-600 border-rose-200',
    custom: 'bg-gray-50 text-gray-600 border-gray-200',
    stock: 'bg-orange-50 text-orange-600 border-orange-200',
    customer: 'bg-purple-50 text-purple-600 border-purple-200',
  };
  return map[c] ?? map[type] ?? 'bg-gray-50 text-gray-600 border-gray-200';
}

function getPriorityClasses(priority: string) {
  const map: Record<string, string> = {
    low: 'bg-blue-50 text-blue-600 border-blue-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    high: 'bg-orange-50 text-orange-600 border-orange-200',
    urgent: 'bg-red-50 text-red-600 border-red-200',
  };
  return map[priority] ?? map.medium;
}

function getCategoryLabel(type: string, notification?: any) {
  const c = canonical(type);
  if (c === 'order' && isOrderStatusChange(type, notification)) {
    const status = getOrderStatusValue(notification);
    if (status) return `Order • ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    return 'Order Update';
  }
  const labels: Record<string, string> = {
    order: 'Orders', review: 'Reviews', product: 'Products', payment: 'Payments',
    shipping: 'Shipping', promotion: 'Promotions', system: 'System', social: 'Social',
    inventory: 'Inventory', security: 'Security', account: 'Account', message: 'Messages',
    achievement: 'Achievements', reminder: 'Reminders', subscription: 'Subscription',
    support: 'Support', analytics: 'Analytics', team: 'Team', event: 'Events', custom: 'Custom',
    stock: 'Inventory', customer: 'Social',
  };
  return labels[c] ?? labels[type] ?? type;
}

function getTimeAgo(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type NotificationFilter = 'all' | 'unread' | 'read' | 'bookmarked';
const ALL_TYPES: NotificationType[] = [
  'order', 'review', 'product', 'payment', 'shipping', 'promotion',
  'system', 'social', 'inventory', 'security',
];

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // ── Zustand store ──────────────────────────────────────────────────
  const notifications = useStore((s) => s.notifications);
  const unreadCount = useStore((s) => s.unreadNotifications);
  const starredCount = useStore((s) => s.starredNotifications);
  const isLoading = useStore((s) => s.isLoadingNotifications);
  const hasMore = useStore((s) => s.hasMoreNotifications);
  const fetchNotifications = useStore((s) => s.fetchNotifications);
  const markNotificationsRead = useStore((s) => s.markNotificationsRead);
  const markNotificationAsRead = useStore((s) => s.markNotificationAsRead);
  const toggleStarNotification = useStore((s) => s.toggleStarNotification);
  const deleteNotification = useStore((s) => s.deleteNotification);
  const bulkDeleteNotifications = useStore((s) => s.bulkDeleteNotifications);
  const bulkMarkNotifications = useStore((s) => s.bulkMarkNotifications);
  const loadMoreNotifications = useStore((s) => s.loadMoreNotifications);

  // ── Local UI state ─────────────────────────────────────────────────
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null);

  // ── Notification type → dashboard page mapping ─────────────────────
  const getPageForType = useCallback((type: NotificationType): PageSection | null => {
    const map: Record<string, PageSection> = {
      order: 'orders',
      product: 'products',
      inventory: 'products',
      review: 'reviews',
      customer: 'customers',
      payment: 'payments',
      coupon: 'coupons',
      promotion: 'coupons',
      shipping: 'shipping',
      security: 'notifications',
      system: 'notifications',
      social: 'notifications',
      message: 'notifications',
      account: 'notifications',
      achievement: 'notifications',
      reminder: 'notifications',
      subscription: 'notifications',
      support: 'notifications',
      analytics: 'analytics',
      team: 'notifications',
      event: 'notifications',
      custom: 'notifications',
    };
    return map[type] ?? null;
  }, []);

  const getViewDetailsTarget = useCallback((notification: Notification): { page: PageSection; label: string; searchQuery: string } | null => {
    const type = canonical(notification.type);

    // Parse metadata — handle both object and JSON string cases
    let m: Record<string, any> | undefined;
    if (notification.metadata && typeof notification.metadata === 'object') {
      m = notification.metadata as Record<string, any>;
    } else if (typeof notification.metadata === 'string') {
      try { m = JSON.parse(notification.metadata); } catch { m = undefined; }
    }

    // Build search query from metadata — this is what the target page will search for
    const buildSearch = (): string => {
      // Type-aware: prefer the field that matches the target page's search
      const pickByType = (): string | null => {
        switch (type) {
          case 'order':      return m?.orderNumber ? String(m.orderNumber) : null;
          case 'product':
          case 'inventory':  return m?.productName ? String(m.productName) : m?.sku ? String(m.sku) : null;
          case 'review':     return m?.customerName ? String(m.customerName) : null;
          case 'customer':
          case 'social':     return m?.customerName ? String(m.customerName) : m?.email ? String(m.email) : null;
          case 'payment':    return m?.orderNumber ? String(m.orderNumber) : null;
          case 'promotion':  return m?.code ? String(m.code) : m?.couponCode ? String(m.couponCode) : null;
          case 'shipping':   return m?.name ? String(m.name) : null;
          default:           return null;
        }
      };
      const typed = pickByType();
      if (typed) return typed;
      // Fallback: any human-readable field
      if (m?.orderNumber) return String(m.orderNumber);
      if (m?.productName) return String(m.productName);
      if (m?.customerName) return String(m.customerName);
      if (m?.couponCode) return String(m.code ?? m.couponCode);
      if (m?.sku) return String(m.sku);
      if (m?.email) return String(m.email);
      if (m?.phone) return String(m.phone);
      if (m?.name) return String(m.name);
      if (m?.code) return String(m.code);
      // Fallback: try to extract from title (e.g. "New Order #SDF-20260826-BBE0FF")
      const titleMatch = notification.title.match(/#([A-Z0-9-]+)/i);
      if (titleMatch) return titleMatch[1];
      // Last resort: ID fields (UUIDs — unlikely to match search, but try)
      if (m?.orderId) return String(m.orderId);
      if (m?.productId) return String(m.productId);
      if (m?.customerId) return String(m.customerId);
      if (m?.couponId) return String(m.couponId);
      if (m?.id) return String(m.id);
      return '';
    };

    const search = buildSearch();

    switch (type) {
      case 'order':      return { page: 'orders',     label: 'Orders',     searchQuery: search };
      case 'product':    return { page: 'products',   label: 'Products',   searchQuery: search };
      case 'inventory':  return { page: 'products',   label: 'Products',   searchQuery: search };
      case 'review':     return { page: 'reviews',    label: 'Reviews',    searchQuery: search };
      case 'customer':
      case 'social':     return { page: 'customers',  label: 'Customers',  searchQuery: search };
      case 'payment':    return { page: 'orders',     label: 'Orders',     searchQuery: search };
      case 'promotion':  return { page: 'coupons',    label: 'Coupons',    searchQuery: search };
      case 'shipping':   return { page: 'shipping',   label: 'Shipping',   searchQuery: search };
      case 'analytics':  return { page: 'analytics',  label: 'Analytics',  searchQuery: search };
      case 'account':    return { page: 'settings',   label: 'Settings',   searchQuery: search };
      // Everything else → Notifications page (system, security, message, achievement, reminder, subscription, support, team, event, custom)
      default:           return { page: 'notifications', label: 'Notifications', searchQuery: search };
    }
  }, []);

  // ── Fetch on mount & filter changes ────────────────────────────────
  useEffect(() => {
    const statusMap: Record<NotificationFilter, string> = {
      all: 'all', unread: 'unread', read: 'read', bookmarked: 'bookmarked',
    };
    fetchNotifications({
      status: statusMap[filter],
      type: selectedType === 'all' ? undefined : selectedType,
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      search: searchQuery || undefined,
      limit: 20,
      offset: 0,
    });
  }, [filter, selectedType, selectedPriority, searchQuery, fetchNotifications]);

  // ── Client-side sort: unread first, then by timestamp ──────────────
  const filteredNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.read && !b.read) return 1;
      if (!a.read && b.read) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [notifications]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    fetchNotifications({
      status: filter === 'all' ? 'all' : filter,
      type: selectedType === 'all' ? undefined : selectedType,
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      search: searchQuery || undefined,
      limit: 20,
      offset: 0,
    });
  }, [filter, selectedType, selectedPriority, searchQuery, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await markNotificationAsRead(id);
      addToast('success', 'Notification marked as read');
    } catch {
      addToast('error', 'Failed to update notification');
    } finally {
      setActionLoading(null);
    }
  }, [markNotificationAsRead, addToast]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markNotificationsRead();
      addToast('success', 'All notifications marked as read');
    } catch {
      addToast('error', 'Failed to mark all as read');
    }
  }, [markNotificationsRead, addToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    setActionLoading(id);
    try {
      await deleteNotification(id);
      addToast('success', 'Notification deleted');
    } catch {
      addToast('error', 'Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  }, [deleteNotification, addToast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} notifications?`)) return;
    try {
      await bulkDeleteNotifications(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectMode(false);
      addToast('success', `${selectedIds.size} notifications deleted`);
    } catch {
      addToast('error', 'Failed to delete notifications');
    }
  }, [selectedIds, bulkDeleteNotifications, addToast]);

  const handleBulkMarkRead = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkMarkNotifications(Array.from(selectedIds), true);
      setSelectedIds(new Set());
      addToast('success', 'Selected notifications marked as read');
    } catch {
      addToast('error', 'Failed to mark notifications');
    }
  }, [selectedIds, bulkMarkNotifications, addToast]);

  const handleToggleBookmark = useCallback(async (id: string) => {
    try {
      await toggleStarNotification(id);
    } catch {
      addToast('error', 'Failed to update bookmark');
    }
  }, [toggleStarNotification, addToast]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredNotifications.length) return new Set();
      return new Set(filteredNotifications.map((n) => n.id));
    });
  }, [filteredNotifications]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) loadMoreNotifications();
  }, [hasMore, isLoading, loadMoreNotifications]);

  const handleViewDetails = useCallback((notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markNotificationAsRead(notification.id).catch(() => {});
    }
    // Open detail modal
    setDetailNotification(notification);
  }, [markNotificationAsRead]);

  const handleNavigateFromDetail = useCallback(() => {
    if (!detailNotification) return;
    const target = getViewDetailsTarget(detailNotification);
    if (target) {
      useStore.getState().setPendingNavigation({
        page: target.page,
        searchQuery: target.searchQuery || undefined,
        action: 'open',
      });
      useStore.getState().setCurrentPage(target.page);
    }
    setDetailNotification(null);
  }, [detailNotification, getViewDetailsTarget]);

  // ── Loading skeleton ───────────────────────────────────────────────
  if (isLoading && notifications.length === 0) {
    return <NotificationsLoadingPage />;
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[var(--dashboard-bg-dark,#0f1411)] dark:via-[var(--dashboard-bg-dark,#0f1411)] dark:to-[var(--dashboard-bg-dark,#0f1411)] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </span>
            Notifications
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
            <Sparkles size={14} className="text-blue-500" />
            Stay updated with real-time alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} size="md" variant="default" />
          <button
            onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center gap-2"
          >
            <CheckCheck size={16} />
            {selectMode ? 'Exit' : 'Select'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition flex items-center gap-2 shadow-sm"
            >
              <Check size={16} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
            <Bell size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{notifications.length}</p>
        </div>
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Unread</span>
            <BellRing size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{unreadCount}</p>
        </div>
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Bookmarks</span>
            <Star size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{starredCount}</p>
        </div>
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Urgent</span>
            <AlertCircle size={16} className="text-red-500 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {notifications.filter((n) => n.priority === 'urgent' || n.priority === 'high').length}
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1.5">
              {(['all', 'unread', 'read', 'bookmarked'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                    filter === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as NotificationType | 'all')}
              className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Types</option>
              {ALL_TYPES.map((type) => (
                <option key={type} value={type}>{getCategoryLabel(type)}</option>
              ))}
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as NotificationPriority | 'all')}
              className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectMode && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              onClick={toggleSelectAll}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 transition flex items-center gap-1"
            >
              {selectedIds.size === filteredNotifications.length
                ? <>Deselect all</>
                : <>Select all ({filteredNotifications.length})</>
              }
            </button>
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{selectedIds.size} selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  onClick={handleBulkMarkRead}
                  className="text-sm text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
                >
                  <Check size={14} /> Mark read
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
              <BellOff size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No notifications found</h3>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery || filter !== 'all' ? 'Try adjusting your filters' : "You're all caught up!"}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/notifications/seed', { method: 'POST' });
                    const json = await res.json();
                    if (!json.success) throw new Error(json.error?.message || 'Seed failed');
                    await fetchNotifications({ limit: 20, offset: 0 });
                    addToast('success', 'Sample notifications loaded');
                  } catch (e: any) {
                    addToast('error', e?.message || 'Failed to load sample notifications');
                  }
                }}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Load Sample Notifications
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const isExpanded = expandedId === notification.id;
            const isSelected = selectedIds.has(notification.id);
            const priorityColor = getPriorityClasses(notification.priority);
            const typeColor = getTypeClasses(notification.type, notification as any);

            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                  !notification.read
                    ? 'border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/[0.08]'
                    : 'border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))]'
                } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
              >
                <div className="p-4 flex items-start gap-3">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelect(notification.id)}
                      className="mt-2 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition"
                      style={{
                        borderColor: isSelected ? 'transparent' : '#94a3b8',
                        background: isSelected ? '#3b82f6' : 'white',
                      }}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>
                  )}

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeColor}`}>
                    {getTypeIcon(notification.type, 18, notification as any)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-semibold ${!notification.read ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                            {notification.title}
                          </h4>
                          <Badge variant="default" size="sm" className={`border ${priorityColor}`}>
                            {notification.priority}
                          </Badge>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          )}
                          {notification.starred && (
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <p className={`text-sm mt-0.5 ${!notification.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor}`}>
                            {getCategoryLabel(notification.type, notification as any)}
                          </span>
                          {notification.metadata?.orderId && (
                            <span className="text-xs text-slate-400">
                              Order: {notification.metadata.orderId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={actionLoading === notification.id}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition text-blue-500 disabled:opacity-50"
                            title="Mark as read"
                          >
                            {actionLoading === notification.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleBookmark(notification.id)}
                          className={`p-1.5 rounded-lg transition ${
                            notification.starred
                              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                          title={notification.starred ? 'Remove bookmark' : 'Bookmark'}
                        >
                          <Star size={16} className={notification.starred ? 'fill-amber-500' : ''} />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : notification.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-400"
                        >
                          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={actionLoading === notification.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition text-slate-400 hover:text-red-500 disabled:opacity-50"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-white/10 mt-1">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Info size={14} className="text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300">Full message:</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{notification.message}</p>
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Metadata</p>
                          <pre className="text-xs bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 overflow-x-auto">
                            {JSON.stringify(notification.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                      <button
                        onClick={() => handleViewDetails(notification)}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
                      >
                        View details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {hasMore && filteredNotifications.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Notification detail modal */}
      {detailNotification && (
        <NotificationDetailModal
          notification={detailNotification}
          onClose={() => setDetailNotification(null)}
          onNavigate={handleNavigateFromDetail}
        />
      )}
    </div>
  );
};

// Loading state component
const NotificationsLoadingPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[var(--dashboard-bg-dark,#0f1411)] dark:via-[var(--dashboard-bg-dark,#0f1411)] dark:to-[var(--dashboard-bg-dark,#0f1411)] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-lg mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))]">
            <div className="flex items-center justify-between">
              <div className="h-4 w-12 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-slate-200 dark:bg-white/10 rounded mt-1 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))]">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 h-10 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded mt-1 animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-white/10 rounded mt-0.5 animate-pulse" />
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
