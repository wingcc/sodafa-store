/**
 * Global Notification Client — callable from ANY page/script
 * Works from: dashboard, store, home, or any React component / plain script.
 *
 * Uses the public POST /api/notifications (service_role internally, no admin auth needed).
 * For dashboard internal use you can still import { notificationService } from '@/lib/services/notificationService' directly (server-only).
 */

export type NotificationType =
  | 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system'
  | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security'
  | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SendNotificationInput {
  type: NotificationType;
  title: string;
  message?: string;
  priority?: NotificationPriority;
  starred?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface SendNotificationResult {
  success: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

/**
 * Send a notification from any page (client or server).
 * - Client: POST /api/notifications
 * - Server (if called inside an API route with service_role): you can also import notificationService directly.
 *
 * @example
 * // From store product page
 * await sendNotification({ type: 'product', title: 'Back in stock!', message: 'Argan Oil is back', priority: 'medium', actionUrl: '/store/products/123' });
 *
 * // From home page
 * await sendNotification({ type: 'promotion', title: 'Flash sale live!', message: '20% off', priority: 'high' });
 *
 * // From any script
 * await sendNotification({ type: 'system', title: 'Hello', message: 'World' });
 */
export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationResult> {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error?.message ?? `HTTP ${res.status}` };
    }
    return { success: true, id: json.data?.id, skipped: json.data?.skipped };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Network error' };
  }
}

// Convenience wrappers — all 20 types (old+new) + 2 legacy aliases
export const notify = {
  order: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'order', title, message, priority: 'high', ...opts }),
  review: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'review', title, message, ...opts }),
  product: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'product', title, message, ...opts }),
  payment: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'payment', title, message, ...opts }),
  shipping: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'shipping', title, message, ...opts }),
  promotion: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'promotion', title, message, priority: 'high', ...opts }),
  system: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'system', title, message, ...opts }),
  social: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'social', title, message, ...opts }),
  inventory: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'inventory', title, message, priority: 'high', ...opts }),
  security: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'security', title, message, priority: 'urgent', ...opts }),
  account: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'account', title, message, ...opts }),
  message: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'message', title, message, ...opts }),
  achievement: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'achievement', title, message, ...opts }),
  reminder: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'reminder', title, message, ...opts }),
  subscription: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'subscription', title, message, priority: 'high', ...opts }),
  support: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'support', title, message, priority: 'high', ...opts }),
  analytics: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'analytics', title, message, ...opts }),
  team: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'team', title, message, ...opts }),
  event: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'event', title, message, ...opts }),
  custom: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'custom', title, message, ...opts }),
  // legacy aliases (customer→social, stock→inventory)
  customer: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'customer', title, message, ...opts }),
  stock: (title: string, message: string, opts?: Partial<SendNotificationInput>) =>
    sendNotification({ type: 'stock', title, message, priority: 'high', ...opts }),
};
