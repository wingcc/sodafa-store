// SODFA MARKETPLACE - Notifications Page
// A beautiful, modern notifications center with real-time updates

'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  X,
  Clock,
  Package,
  Star,
  MessageSquare,
  ShoppingBag,
  Tag,
  Truck,
  CreditCard,
  User,
  Heart,
  TrendingUp,
  Award,
  Gift,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Mail,
  Calendar,
  MoreVertical,
  Search,
  Filter,
  Settings,
  BellRing,
  BellOff,
  Loader2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';
import { useStore } from '../store/useStore';

type NotificationType = 
  | 'order'
  | 'review'
  | 'product'
  | 'payment'
  | 'shipping'
  | 'promotion'
  | 'system'
  | 'social'
  | 'inventory'
  | 'security';

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  image?: string;
  metadata?: Record<string, any>;
  category?: string;
};

type NotificationFilter = 'all' | 'unread' | 'read' | 'bookmarked';

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Simulated notifications data
  const generateMockNotifications = (): Notification[] => {
    const types: NotificationType[] = ['order', 'review', 'product', 'payment', 'shipping', 'promotion', 'system', 'social', 'inventory', 'security'];
    const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent'];
    const titles = [
      'New order received',
      'Product review submitted',
      'Payment confirmed',
      'Shipping update',
      'Special promotion available',
      'System maintenance notice',
      'New follower alert',
      'Inventory alert',
      'Security alert',
      'Account update',
      'Review approved',
      'Order shipped',
      'Refund processed',
      'Product restocked',
      'Welcome offer',
      'Subscription renewal'
    ];
    const messages = [
      'Customer #12345 placed an order for 3 items.',
      'A customer has submitted a 5-star review for "Premium Headphones".',
      'Payment of $249.99 has been confirmed for order #ORD-2024-001.',
      'Your package has been shipped and is on its way to the delivery address.',
      'Flash sale: Get 20% off on all accessories for the next 24 hours!',
      'Scheduled maintenance on Dec 15, 2024 from 2AM to 4AM UTC.',
      'Sarah J. started following your store.',
      'Low stock alert: Product "Wireless Charger" has only 5 units remaining.',
      'New login detected from an unrecognized device in Paris, France.',
      'Your seller profile has been updated successfully.',
      'Customer review for "Smart Watch" has been approved by the moderation team.',
      'Order #ORD-2024-002 has been shipped. Tracking: TRK-7890-1234.',
      'Refund of $89.99 for order #ORD-2024-003 has been processed.',
      'Product "Noise-Canceling Headphones" is back in stock!',
      'Welcome to the platform! Use code WELCOME20 for 20% off your first order.',
      'Your subscription for the Pro plan will renew in 7 days.'
    ];

    const notificationData: Notification[] = [];
    for (let i = 0; i < 30; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const read = Math.random() > 0.4;
      const bookmarked = Math.random() > 0.8;
      const hoursAgo = Math.floor(Math.random() * 168); // 7 days
      
      notificationData.push({
        id: `notif-${i + 1}`,
        type,
        title: titles[Math.floor(Math.random() * titles.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        read,
        priority,
        metadata: {
          orderId: i < 5 ? `ORD-2024-${String(i + 1).padStart(3, '0')}` : undefined,
          customerId: `cust-${1000 + i}`,
          productId: `prod-${2000 + i}`,
        },
        actionUrl: i % 3 === 0 ? '/dashboard' : undefined,
      });
    }
    
    // Ensure some unread
    notificationData[0].read = false;
    notificationData[0].priority = 'urgent';
    notificationData[1].read = false;
    notificationData[2].read = false;
    notificationData[2].priority = 'high';
    
    return notificationData;
  };

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        const data = generateMockNotifications();
        setNotifications(data);
      } catch (error) {
        addToast('error', 'Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const getTypeIcon = (type: NotificationType) => {
    const icons = {
      order: <ShoppingBag size={18} />,
      review: <Star size={18} />,
      product: <Package size={18} />,
      payment: <CreditCard size={18} />,
      shipping: <Truck size={18} />,
      promotion: <Gift size={18} />,
      system: <Info size={18} />,
      social: <User size={18} />,
      inventory: <TrendingUp size={18} />,
      security: <AlertCircle size={18} />,
    };
    return icons[type] || <Bell size={18} />;
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    const colors = {
      low: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20',
      medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      urgent: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
    };
    return colors[priority];
  };

  const getTypeColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      order: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/20',
      review: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-500/20',
      product: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20',
      payment: 'bg-green-50 text-green-600 border-green-200',
      shipping: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      promotion: 'bg-pink-50 text-pink-600 border-pink-200',
      system: 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10',
      social: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/20',
      inventory: 'bg-orange-50 text-orange-600 border-orange-200',
      security: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
    };
    return colors[type] || 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      addToast('success', 'Notification marked as read');
    } catch (error) {
      addToast('error', 'Failed to update notification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('success', 'All notifications marked as read');
    } catch (error) {
      addToast('error', 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    setActionLoading(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setNotifications(prev => prev.filter(n => n.id !== id));
      addToast('success', 'Notification deleted');
    } catch (error) {
      addToast('error', 'Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} notifications?`)) return;
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
    addToast('success', `${selectedIds.size} notifications deleted`);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        addToast('info', 'Removed from bookmarks');
      } else {
        newSet.add(id);
        addToast('success', 'Bookmarked');
      }
      return newSet;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const getCategoryLabel = (type: NotificationType) => {
    const labels: Record<NotificationType, string> = {
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
    };
    return labels[type] || type;
  };

  const filteredNotifications = notifications
    .filter(n => {
      if (filter === 'unread') return !n.read;
      if (filter === 'read') return n.read;
      if (filter === 'bookmarked') return bookmarkedIds.has(n.id);
      return true;
    })
    .filter(n => {
      if (selectedType === 'all') return true;
      return n.type === selectedType;
    })
    .filter(n => {
      if (selectedPriority === 'all') return true;
      return n.priority === selectedPriority;
    })
    .filter(n => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(query) || 
             n.message.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      // Unread first, then by timestamp
      if (a.read && !b.read) return 1;
      if (!a.read && b.read) return -1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Loading state
  if (isLoading) {
    return <NotificationsLoadingPage />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[var(--dashboard-bg-dark,#0f1411)] dark:via-[var(--dashboard-bg-dark,#0f1411)] dark:to-[var(--dashboard-bg-dark,#0f1411)] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-50 dark:bg-red-500/100 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
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
          <RefreshButton 
            onRefresh={() => {
              setIsLoading(true);
              setTimeout(() => {
                setNotifications(generateMockNotifications());
                setIsLoading(false);
                addToast('info', 'Notifications refreshed');
              }, 800);
            }} 
            isLoading={isLoading} 
            size="md" 
            variant="default" 
          />
          <button
            onClick={() => setSelectMode(!selectMode)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center gap-2"
          >
            <CheckCheck size={16} />
            {selectMode ? 'Exit' : 'Select'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 dark:bg-blue-500/100 text-white hover:bg-blue-600 transition flex items-center gap-2 shadow-sm shadow-blue-200"
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
          <p className="text-2xl font-bold text-blue-600 mt-1">{unreadCount}</p>
        </div>
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Bookmarks</span>
            <Star size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{bookmarkedIds.size}</p>
        </div>
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Urgent</span>
            <AlertCircle size={16} className="text-red-500 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length}
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
                      ? 'bg-blue-50 dark:bg-blue-500/100 text-white border-blue-500 shadow-sm shadow-blue-200'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 text-xs bg-blue-50 dark:bg-blue-500/100 text-white px-1.5 py-0.5 rounded-full">
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
              {['order', 'review', 'product', 'payment', 'shipping', 'promotion', 'system', 'social', 'inventory', 'security'].map((type) => (
                <option key={type} value={type}>{getCategoryLabel(type as NotificationType)}</option>
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
              {selectedIds.size === filteredNotifications.length ? (
                <>Deselect all</>
              ) : (
                <>Select all ({filteredNotifications.length})</>
              )}
            </button>
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{selectedIds.size} selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 transition flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => 
                      selectedIds.has(n.id) ? { ...n, read: true } : n
                    ));
                    setSelectedIds(new Set());
                    addToast('success', 'Selected notifications marked as read');
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600 transition flex items-center gap-1"
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
              {searchQuery || filter !== 'all' ? 'Try adjusting your filters' : 'You\'re all caught up!'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/notifications/seed', { method: 'POST' });
                    const json = await res.json();
                    if (!json.success) throw new Error(json.error?.message || 'Seed failed');
                    await useStore.getState().fetchNotifications();
                    setNotifications(useStore.getState().notifications.slice(0, 20) as unknown as Notification[]);
                    addToast('success', 'Sample notifications loaded');
                  } catch (e: any) {
                    addToast('error', e?.message || 'Failed to load sample notifications');
                  }
                }}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-50 dark:bg-blue-500/100 hover:bg-blue-600 transition-colors"
              >
                Load Sample Notifications
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const isExpanded = expandedId === notification.id;
            const isBookmarked = bookmarkedIds.has(notification.id);
            const isSelected = selectedIds.has(notification.id);
            const priorityColor = getPriorityColor(notification.priority);
            const typeColor = getTypeColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                  !notification.read ? 'border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/[0.08]' : 'border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))]'
                } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
              >
                <div className="p-4 flex items-start gap-3">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelect(notification.id)}
                      className="mt-2 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition"
                      style={{
                        borderColor: isSelected ? 'transparent' : '#94a3b8',
                        background: isSelected ? '#3b82f6' : 'white'
                      }}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>
                  )}
                  
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeColor}`}>
                    {getTypeIcon(notification.type)}
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
                            <span className="w-2 h-2 rounded-full bg-blue-50 dark:bg-blue-500/100 animate-pulse"></span>
                          )}
                          {isBookmarked && (
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
                            {getCategoryLabel(notification.type)}
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
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg hover:bg-blue-100 transition text-blue-500 disabled:opacity-50"
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
                          onClick={() => toggleBookmark(notification.id)}
                          className={`p-1.5 rounded-lg transition ${
                            isBookmarked ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                        >
                          <Star size={16} className={isBookmarked ? 'fill-amber-500' : ''} />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : notification.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-400"
                        >
                          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={!!actionLoading}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-500 disabled:opacity-50"
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
                      {notification.actionUrl && (
                        <button className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition flex items-center gap-1">
                          View details <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {filteredNotifications.length > 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
            Load more
          </button>
        </div>
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
          <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-32 bg-slate-200 rounded-lg mt-1 animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))]">
            <div className="flex items-center justify-between">
              <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded mt-1 animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl p-4 border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))]">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.1))] p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-4 w-full bg-slate-200 rounded mt-1 animate-pulse"></div>
                <div className="h-4 w-48 bg-slate-200 rounded mt-0.5 animate-pulse"></div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;