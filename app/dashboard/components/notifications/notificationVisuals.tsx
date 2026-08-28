// Shared notification visuals — used by Notification Center page + Header popup/bell
// Keeps icon/color system single source of truth per spec §4

import React from 'react';
import {
  ShoppingBag,
  Star,
  Package,
  CreditCard,
  Truck,
  Gift,
  Info,
  User,
  TrendingUp,
  ShieldAlert,
  Bell,
  Tag,
  Users,
  AlertTriangle,
  ShoppingCart,
  Settings,
  MessageSquare,
  Award,
  Calendar,
  Headphones,
  BarChart3,
  UsersRound,
  Megaphone,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Cog,
  PackageCheck,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import type { NotificationType, NotificationPriority } from '../../types';

// ── Order status-change helpers (single source of truth) ───────────────
// New order (ShoppingBag) vs status-change (distinct icon) are both type='order'
// We distinguish by metadata.status / title / message so no DB migration needed.

export type OrderStatusIconOpts = { metadata?: any; title?: string; message?: string } | any;

function parseMeta(meta: any): any {
  if (!meta) return null;
  if (typeof meta === 'string') {
    try { return JSON.parse(meta); } catch { return null; }
  }
  return meta;
}

function isOrderStatusChange(type: string, opts?: OrderStatusIconOpts): boolean {
  const c = canonical(type);
  if (c !== 'order') return false;
  if (!opts) return false;
  // opts may be the full notification object
  const rawMeta = (opts as any).metadata;
  const meta = parseMeta(rawMeta) ?? (opts as any);
  const title = (opts as any).title ?? '';
  const message = (opts as any).message ?? '';
  const status = meta?.status ?? (meta as any)?.kind === 'status_change' ? (meta?.status || 'updated') : null;
  if (status && typeof status === 'string' && status.length > 0) return true;
  if (meta?.kind === 'status_change') return true;
  // fallback heuristics for legacy rows / seed data that used title/message without metadata.status
  if (typeof title === 'string' && /updated|cancelled|delivered|shipped|processing|confirmed|refunded/i.test(title)) return true;
  if (typeof message === 'string' && /status changed/i.test(message)) return true;
  return false;
}

function getOrderStatusValue(opts?: OrderStatusIconOpts): string {
  if (!opts) return '';
  const rawMeta = (opts as any).metadata;
  const meta = parseMeta(rawMeta) ?? (opts as any);
  const raw = meta?.status ?? (opts as any).status ?? '';
  if (typeof raw === 'string' && raw.length > 0) return raw.toLowerCase();
  // fallback: infer from title/message for legacy/seed rows that lack metadata.status
  const text = `${(opts as any).title ?? ''} ${(opts as any).message ?? ''}`;
  const m = text.match(/\b(pending|confirmed|processing|shipped|delivered|cancelled|refunded)\b/i);
  return m ? m[1].toLowerCase() : '';
}

// Legacy aliases → canonical visual key
const CANONICAL_TYPE: Record<string, NotificationType> = {
  stock: 'inventory',
  customer: 'social',
};

function canonical(t: string): NotificationType {
  return (CANONICAL_TYPE[t] ?? t) as NotificationType;
}

export function getTypeIcon(type: string, size = 18, notification?: OrderStatusIconOpts) {
  const c = canonical(type);

  // ── Order: new-order vs status-change get DIFFERENT icons (same DB type='order')
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
    // generic status-change fallback — distinct from new-order's ShoppingBag
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
    // legacy fallbacks keep old Header look if DB still has stock/customer
    stock: <TrendingUp size={size} />,
    customer: <User size={size} />,
  };
  return map[c] ?? map[type] ?? <Bell size={size} />;
}

export function getPriorityClasses(priority: string) {
  const map: Record<string, string> = {
    low: 'bg-blue-50 text-blue-600 border-blue-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    high: 'bg-orange-50 text-orange-600 border-orange-200',
    urgent: 'bg-red-50 text-red-600 border-red-200',
  };
  return map[priority] ?? map.medium;
}

export function getTypeClasses(type: string, notification?: OrderStatusIconOpts) {
  const c = canonical(type);

  // Order status-change: keep Orders family but give per-status tint so the
  // timeline is scannable (pending=amber, shipped=cyan, delivered=emerald,
  // cancelled=red, refunded=orange). New orders stay indigo.
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
    // generic status-change — still Orders family but slightly warm to differ from new-order indigo
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

export function getCategoryLabel(type: string, notification?: OrderStatusIconOpts) {
  const c = canonical(type);
  // Order status-change reads as "Order Update" in chips so users can spot it,
  // but filters still group under "Orders" — caller passes notification only for display.
  if (c === 'order' && isOrderStatusChange(type, notification)) {
    const status = getOrderStatusValue(notification);
    if (status) return `Order • ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    return 'Order Update';
  }
  const labels: Record<string, string> = {
    order: 'Orders',
    review: 'Reviews',
    product: 'Products',
    payment: 'Payments',
    shipping: 'Shipping',
    promotion: 'Promotions',
    system: 'System',
    social: 'Social',
    inventory: 'Inventory',
    security: 'Security',
    account: 'Account',
    message: 'Messages',
    achievement: 'Achievements',
    reminder: 'Reminders',
    subscription: 'Subscription',
    support: 'Support',
    analytics: 'Analytics',
    team: 'Team',
    event: 'Events',
    custom: 'Custom',
    stock: 'Inventory',
    customer: 'Social',
  };
  // preserve original casing for unknown types
  return labels[c] ?? labels[type] ?? type;
}

// Compact relative time (same as new page's getTimeAgo)
export function formatRelativeTime(dateInput: string | Date) {
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

// Header popup — same as Center: subtle bg, border + icon same deep color family, rounded border
export function getHeaderBg(type: string, notification?: OrderStatusIconOpts) {
  return getTypeClasses(type, notification);
}

// Header icon — very dark/deep version, same family as border/bg (inherits from getTypeClasses via parent)
export function getHeaderIcon(type: string, size = 15, notification?: OrderStatusIconOpts) {
  return getTypeIcon(type, size, notification);
}
