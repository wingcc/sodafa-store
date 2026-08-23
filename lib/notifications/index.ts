/**
 * Global Notifications — public entry point
 * Import from '@/lib/notifications' anywhere (store, home, dashboard, scripts)
 */

export * from './client';
export { notificationService } from '@/lib/services/notificationService';
export type { NotificationType, NotificationPriority, NotificationEvent } from '@/lib/services/notificationService';
