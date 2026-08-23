'use client';

import { useCallback } from 'react';
import { useStore } from '@/app/dashboard/store/useStore';
import { sendNotification, type SendNotificationInput } from './client';

/**
 * Dashboard hook: full CRUD + global send
 * - Reads from the single source of truth (useStore)
 * - Send uses the global public API
 */
export function useNotifications() {
  const {
    notifications,
    unreadNotifications,
    starredNotifications,
    isLoadingNotifications,
    notificationsError,
    hasMoreNotifications,
    fetchNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    toggleStarNotification,
    deleteNotification,
    markNotificationsRead,
    bulkDeleteNotifications,
    bulkMarkNotifications,
    loadMoreNotifications,
  } = useStore();

  const send = useCallback(async (input: SendNotificationInput) => {
    const res = await sendNotification(input);
    if (res.success && !res.skipped) {
      // refresh center + bell count
      await fetchNotifications({ limit: 20, offset: 0 });
    }
    return res;
  }, [fetchNotifications]);

  return {
    // data
    notifications,
    unreadCount: unreadNotifications,
    starredCount: starredNotifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    hasMore: hasMoreNotifications,
    // fetch / pagination / filters
    fetch: fetchNotifications,
    loadMore: loadMoreNotifications,
    // mutations
    markRead: markNotificationAsRead,
    markUnread: markNotificationAsUnread,
    toggleStar: toggleStarNotification,
    remove: deleteNotification,
    markAllRead: markNotificationsRead,
    bulkDelete: bulkDeleteNotifications,
    bulkMark: bulkMarkNotifications,
    // global send (works from any page)
    send,
  };
}
