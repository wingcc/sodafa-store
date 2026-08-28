'use client';

import React from 'react';
import {
  X,
  Bell,
  Clock,
  Star,
  ExternalLink,
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
  RefreshCw,
  CheckCircle2,
  Cog,
  PackageCheck,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import type { Notification, NotificationType } from '../../types';

const CANONICAL_TYPE: Record<string, NotificationType> = {
  stock: 'inventory',
  customer: 'social',
};

function canonical(t: string): NotificationType {
  return (CANONICAL_TYPE[t] ?? t) as NotificationType;
}

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

function getTypeIcon(type: string, size = 20, notification?: any) {
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
    account: <Calendar size={size} />,
    message: <MessageSquare size={size} />,
    achievement: <Award size={size} />,
    reminder: <Calendar size={size} />,
    subscription: <Bell size={size} />,
    support: <Headphones size={size} />,
    analytics: <BarChart3 size={size} />,
    team: <UsersRound size={size} />,
    event: <Megaphone size={size} />,
    custom: <Plus size={size} />,
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
    order: 'Order', review: 'Review', product: 'Product', payment: 'Payment',
    shipping: 'Shipping', promotion: 'Promotion', system: 'System', social: 'Social',
    inventory: 'Inventory', security: 'Security', account: 'Account', message: 'Message',
    achievement: 'Achievement', reminder: 'Reminder', subscription: 'Subscription',
    support: 'Support', analytics: 'Analytics', team: 'Team', event: 'Event', custom: 'Custom',
  };
  return labels[c] ?? labels[type] ?? type;
}

function formatDate(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface NotificationDetailModalProps {
  notification: Notification;
  onClose: () => void;
  onNavigate?: () => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  onClose,
  onNavigate,
}) => {
  const typeColor = getTypeClasses(notification.type, notification as any);
  const priorityColor = getPriorityClasses(notification.priority);

  // Parse metadata — handle both object and JSON string cases
  let metadata: Record<string, any> | undefined;
  if (notification.metadata && typeof notification.metadata === 'object') {
    metadata = notification.metadata as Record<string, any>;
  } else if (typeof notification.metadata === 'string') {
    try { metadata = JSON.parse(notification.metadata); } catch { metadata = undefined; }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden border border-slate-200 dark:border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${typeColor}`}>
              {getTypeIcon(notification.type, 20, notification as any)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor}`}>
                  {getCategoryLabel(notification.type, notification as any)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor}`}>
                  {notification.priority}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
          {/* Message */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Message
            </label>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock size={14} />
            <span>{formatDate(notification.timestamp)}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-blue-500 animate-pulse'}`} />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {notification.read ? 'Read' : 'Unread'}
            </span>
            {notification.starred && (
              <>
                <span className="text-slate-300">·</span>
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Bookmarked</span>
              </>
            )}
          </div>

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Details
              </label>
              <div className="mt-2 bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/10">
                {Object.entries(metadata).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') return null;
                  return (
                    <div key={key} className="flex items-start gap-2 py-1.5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[100px] capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-200 break-all">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action URL */}
          {notification.actionUrl && (
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Link
              </label>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 break-all">
                {notification.actionUrl}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-100 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
          >
            Close
          </button>
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <ExternalLink size={14} />
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
