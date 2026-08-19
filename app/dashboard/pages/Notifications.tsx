// SODFA MARKETPLACE - Notifications Page

import React, { useEffect } from 'react';
import {
  Bell,
  ShoppingCart,
  Users,
  AlertTriangle,
  Star,
  CreditCard,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';

const Notifications: React.FC = () => {
  const {
    notifications,
    isLoadingNotifications,
    fetchNotifications,
    markNotificationsRead,
    markNotificationAsRead,
    deleteNotification,
  } = useStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} className="text-purple-600" />;
      case 'customer': return <Users size={16} className="text-sky-600" />;
      case 'stock': return <AlertTriangle size={16} className="text-amber-600" />;
      case 'review': return <Star size={16} className="text-pink-600" />;
      case 'payment': return <CreditCard size={16} className="text-emerald-600" />;
      case 'system': return <Settings size={16} className="text-gray-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-purple-50';
      case 'customer': return 'bg-sky-50';
      case 'stock': return 'bg-amber-50';
      case 'review': return 'bg-pink-50';
      case 'payment': return 'bg-emerald-50';
      case 'system': return 'bg-gray-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLoadingNotifications ? 'Loading notifications...' : 'Stay updated with your store activity'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={fetchNotifications}
            isLoading={isLoadingNotifications}
            size="md"
            variant="default"
          />
          {notifications.some((n) => !n.read) && (
            <button
              onClick={markNotificationsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            No notifications available.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 hover:shadow-md transition-all ${
                !notif.read ? 'border-l-4 border-l-[#cda552]' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${getBgColor(notif.type)} flex items-center justify-center flex-shrink-0`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900">{notif.title}</h4>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-[#cda552] rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
