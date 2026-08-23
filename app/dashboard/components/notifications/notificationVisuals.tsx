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
} from 'lucide-react';
import type { NotificationType, NotificationPriority } from '../../types';

// Legacy aliases → canonical visual key
const CANONICAL_TYPE: Record<string, NotificationType> = {
  stock: 'inventory',
  customer: 'social',
};

function canonical(t: string): NotificationType {
  return (CANONICAL_TYPE[t] ?? t) as NotificationType;
}

export function getTypeIcon(type: string, size = 18) {
  const c = canonical(type);
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

export function getTypeClasses(type: string) {
  const c = canonical(type);
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

export function getCategoryLabel(type: string) {
  const c = canonical(type);
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
export function getHeaderBg(type: string) {
  return getTypeClasses(type);
}

// Header icon — very dark/deep version, same family as border/bg (inherits from getTypeClasses via parent)
export function getHeaderIcon(type: string, size = 15) {
  return getTypeIcon(type, size);
}
