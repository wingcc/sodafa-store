/**
 * Notification Service
 * Centralized service for creating and managing notifications across the dashboard
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { NotificationRepository } from '@/lib/db/repositories/notification';
import type { NotificationInsert } from '@/lib/supabase/types';

export type NotificationType = 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security' | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';

// maps legacy UI aliases (inventory<->stock, social<->customer)
export const TYPE_ALIASES: Record<string, NotificationType> = { inventory: 'stock', stock: 'stock', social: 'customer', customer: 'customer' };

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationEvent {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
  starred?: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private repo: NotificationRepository | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private getRepository(): NotificationRepository {
    if (!this.repo) {
      const admin = createAdminClient();
      this.repo = new NotificationRepository(admin);
    }
    return this.repo;
  }

  /**
   * Create a new notification
   */
  async create(event: NotificationEvent): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const repo = this.getRepository();
      const notification: NotificationInsert = {
        type: event.type as any,
        title: event.title,
        message: event.message,
        action_url: event.actionUrl ?? null,
        read: false,
        priority: (event.priority ?? 'medium') as any,
        starred: event.starred ?? false,
        metadata: (event.metadata ?? {}) as any,
      };

      const { data, error } = await repo.create(notification);

      if (error) {
        console.error('Failed to create notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (err) {
      console.error('NotificationService.create error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Create multiple notifications at once
   */
  async createMany(events: NotificationEvent[]): Promise<{ success: boolean; count: number }> {
    let count = 0;
    for (const event of events) {
      const result = await this.create(event);
      if (result.success) count++;
    }
    return { success: count > 0, count };
  }

  // â”€â”€â”€ Convenience methods for common events â”€â”€â”€

  async notifyNewOrder(orderId: string, orderNumber: string, customerName: string, total: number): Promise<void> {
    await this.create({
      type: 'order',
      priority: 'high',
      title: `New Order #${orderNumber}`,
      message: `Order from ${customerName} for ${total.toLocaleString()} MAD`,
      actionUrl: `/dashboard/orders/${orderId}`,
      metadata: { orderId, orderNumber, customerName, total },
    });
  }

  async notifyOrderStatusChange(orderId: string, orderNumber: string, newStatus: string, opts?: { previousStatus?: string; note?: string }): Promise<void> {
    // Distinct icon/color for status-change vs new-order is handled in notificationVisuals via metadata.status
    // Keep same DB type='order' so filters still group under Orders, but visuals show RefreshCw / per-status icon.
    const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    // Priority hint per status (delivered=low, cancelled/refunded=high, others=medium)
    const priorityMap: Record<string, NotificationPriority> = {
      pending: 'medium',
      confirmed: 'medium',
      processing: 'medium',
      shipped: 'medium',
      delivered: 'low',
      cancelled: 'high',
      refunded: 'high',
    };
    await this.create({
      type: 'order',
      priority: priorityMap[newStatus.toLowerCase()] ?? 'medium',
      title: `Order #${orderNumber} — ${statusLabel}`,
      message: `Order status changed to ${statusLabel}${opts?.note ? ` — ${opts.note}` : ''}`,
      actionUrl: `/dashboard/orders/${orderId}`,
      metadata: { orderId, orderNumber, status: newStatus, previousStatus: opts?.previousStatus, note: opts?.note, kind: 'status_change' },
    });
  }

  async notifyLowStock(productId: string, productName: string, currentStock: number, threshold: number): Promise<void> {
    await this.create({
      type: 'inventory',
      priority: 'high',
      title: 'Low Stock Alert',
      message: `${productName} has only ${currentStock} units left (threshold: ${threshold})`,
      actionUrl: `/dashboard/products/${productId}`,
      metadata: { productId, productName, currentStock, threshold },
    });
  }

  async notifyOutOfStock(productId: string, productName: string): Promise<void> {
    await this.create({
      type: 'inventory',
      priority: 'urgent',
      title: 'Out of Stock',
      message: `${productName} is now out of stock`,
      actionUrl: `/dashboard/products/${productId}`,
      metadata: { productId, productName },
    });
  }

  async notifyNewCustomer(customerId: string, customerName: string, email: string): Promise<void> {
    await this.create({
      type: 'customer',
      title: 'New Customer Registered',
      message: `${customerName} (${email}) created an account`,
      actionUrl: `/dashboard/customers/${customerId}`,
      metadata: { customerId, customerName, email },
    });
  }

  async notifyNewReview(reviewId: string, productName: string, customerName: string, rating: number): Promise<void> {
    await this.create({
      type: 'review',
      priority: rating <= 2 ? 'high' : 'medium',
      title: 'New Review Received',
      message: `${customerName} left a ${rating}-star review for ${productName}`,
      actionUrl: `/dashboard/reviews`,
      metadata: { reviewId, productName, customerName, rating },
    });
  }

  async notifyPaymentReceived(orderId: string, orderNumber: string, amount: number, method: string): Promise<void> {
    await this.create({
      type: 'payment',
      priority: 'medium',
      title: 'Payment Received',
      message: `Payment of ${amount.toLocaleString()} MAD received for order #${orderNumber} via ${method}`,
      actionUrl: `/dashboard/orders/${orderId}`,
      metadata: { orderId, orderNumber, amount, method },
    });
  }

  async notifyPaymentFailed(orderId: string, orderNumber: string, reason: string): Promise<void> {
    await this.create({
      type: 'payment',
      priority: 'high',
      title: 'Payment Failed',
      message: `Payment for order #${orderNumber} failed: ${reason}`,
      actionUrl: `/dashboard/orders/${orderId}`,
      metadata: { orderId, orderNumber, reason },
    });
  }

  async notifyRefund(orderId: string, orderNumber: string, amount: number): Promise<void> {
    await this.create({
      type: 'payment',
      title: 'Refund Processed',
      message: `Refund of ${amount.toLocaleString()} MAD processed for order #${orderNumber}`,
      actionUrl: `/dashboard/orders/${orderId}`,
      metadata: { orderId, orderNumber, amount },
    });
  }

  async notifyCouponUsed(
    couponId: string,
    couponCode: string,
    orderNumber: string,
    customerName: string,
    discount: number,
    discountType: string,
  ): Promise<void> {
    await this.create({
      type: 'promotion',
      priority: 'medium',
      title: `Coupon #${couponCode} Used`,
      message: `${customerName} used coupon "${couponCode}" on order #${orderNumber} — ${discountType === 'percentage' ? `${discount}% discount` : `${discount} MAD off`}`,
      actionUrl: `/dashboard/coupons`,
      metadata: { couponId, code: couponCode, orderNumber, customerName, discount, discountType },
    });
  }

  async notifyDailyReport(summary: { orders: number; revenue: number; customers: number; date: string }): Promise<void> {
    await this.create({
      type: 'system',
      title: `Daily Report - ${summary.date}`,
      message: `${summary.orders} orders, ${summary.revenue.toLocaleString()} MAD revenue, ${summary.customers} new customers`,
      actionUrl: '/dashboard/analytics',
    });
  }

  async notifySystemError(error: string, context?: string): Promise<void> {
    await this.create({
      type: 'system',
      title: 'System Error',
      message: `${error}${context ? ` (${context})` : ''}`,
      actionUrl: '/dashboard/settings',
    });
  }

  async notifySecurityEvent(event: string, details: string): Promise<void> {
    await this.create({
      type: 'security',
      priority: 'urgent',
      title: 'Security Alert',
      message: `${event}: ${details}`,
      actionUrl: '/dashboard/settings/security',
    });
  }

  async notifyTokenUsage(usage: string, limit: string): Promise<void> {
    await this.create({
      type: 'system',
      title: 'API Usage Alert',
      message: `Token usage: ${usage} / ${limit}`,
      actionUrl: '/dashboard/settings/api',
    });
  }

  /**
   * Check and notify for low stock products
   * This should be called periodically (e.g., via cron job)
   */
  async checkAndNotifyLowStock(): Promise<void> {
    try {
      const admin = createAdminClient();
      const { data: products, error } = await admin
        .from('products')
        .select('id, name, stock, low_stock_threshold')
        .eq('track_inventory', true)
        .lte('stock', 10); // This will be refined by the threshold check in code

      if (error || !products) return;

      for (const product of products) {
        if (product.stock <= 0) {
          await this.notifyOutOfStock(product.id, product.name);
        } else if (product.stock <= (product.low_stock_threshold || 10)) {
          await this.notifyLowStock(product.id, product.name, product.stock, product.low_stock_threshold || 10);
        }
      }
    } catch (err) {
      console.error('checkAndNotifyLowStock error:', err);
    }
  }

  /**
   * Get notification preferences from store_settings
   */
  async getPreferences(): Promise<Record<string, boolean>> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('store_settings')
        .select('key, value')
        .in('key', [
          'notify_new_orders',
          'notify_low_stock',
          'notify_new_reviews',
          'notify_payments',
          'notify_daily_reports',
          'notify_system_errors',
          'notify_security_events',
          'notify_new_customers',
          'notify_product',
          'notify_shipping',
          'notify_promotion',
          'notify_social',
          'notify_account',
          'notify_message',
          'notify_achievement',
          'notify_reminder',
          'notify_subscription',
          'notify_support',
          'notify_analytics',
          'notify_team',
          'notify_event',
          'notify_custom',
          'notify_order_pending',
          'notify_order_confirmed',
          'notify_order_processing',
          'notify_order_shipped',
          'notify_order_delivered',
          'notify_order_cancelled',
          'notify_order_refunded',
        ]);

      if (error) throw error;

      const defaults = {
        notify_new_orders: true,
        notify_low_stock: true,
        notify_new_reviews: true,
        notify_payments: true,
        notify_daily_reports: true,
        notify_system_errors: true,
        notify_security_events: true,
        notify_new_customers: true,
        notify_product: true,
        notify_shipping: true,
        notify_promotion: true,
        notify_social: true,
        notify_account: true,
        notify_message: true,
        notify_achievement: true,
        notify_reminder: true,
        notify_subscription: true,
        notify_support: true,
        notify_analytics: true,
        notify_team: true,
        notify_event: true,
        notify_custom: true,
        notify_order_pending: true,
        notify_order_confirmed: true,
        notify_order_processing: true,
        notify_order_shipped: true,
        notify_order_delivered: true,
        notify_order_cancelled: true,
        notify_order_refunded: true,
      };

      if (!data) return defaults;

      const prefs: Record<string, boolean> = { ...defaults };
      for (const item of data) {
        prefs[item.key] = item.value === 'true';
      }
      return prefs;
    } catch (err) {
      console.error('getPreferences error:', err);
      return {
        notify_new_orders: true,
        notify_low_stock: true,
        notify_new_reviews: true,
        notify_payments: true,
        notify_daily_reports: true,
        notify_system_errors: true,
        notify_security_events: true,
        notify_new_customers: true,
        notify_product: true,
        notify_shipping: true,
        notify_promotion: true,
        notify_social: true,
        notify_account: true,
        notify_message: true,
        notify_achievement: true,
        notify_reminder: true,
        notify_subscription: true,
        notify_support: true,
        notify_analytics: true,
        notify_team: true,
        notify_event: true,
        notify_custom: true,
        notify_order_pending: true,
        notify_order_confirmed: true,
        notify_order_processing: true,
        notify_order_shipped: true,
        notify_order_delivered: true,
        notify_order_cancelled: true,
        notify_order_refunded: true,
      };
    }
  }

  /**
   * Check if a notification type is enabled
   */
  async isEnabled(type: string): Promise<boolean> {
    const prefs = await this.getPreferences();
    return prefs[type] ?? true;
  }

  /**
   * Create notification only if the type is enabled
   * Orders have granular sub-preferences: new-order vs per-status change.
   * - New order (no metadata.status) → checks notify_new_orders
   * - Status change (metadata.status / kind) → checks notify_order_<status> (pending…refunded)
   *   If parent notify_new_orders is OFF, status changes are also skipped (master kill-switch).
   */
  async createIfEnabled(event: NotificationEvent): Promise<{ success: boolean; id?: string; error?: string }> {
    const typeMap: Record<NotificationType, string> = {
      order: 'notify_new_orders',
      customer: 'notify_new_customers',
      stock: 'notify_low_stock',
      inventory: 'notify_low_stock',
      review: 'notify_new_reviews',
      payment: 'notify_payments',
      system: 'notify_system_errors',
      product: 'notify_product',
      shipping: 'notify_shipping',
      promotion: 'notify_promotion',
      social: 'notify_social',
      security: 'notify_security_events',
      account: 'notify_account',
      message: 'notify_message',
      achievement: 'notify_achievement',
      reminder: 'notify_reminder',
      subscription: 'notify_subscription',
      support: 'notify_support',
      analytics: 'notify_analytics',
      team: 'notify_team',
      event: 'notify_event',
      custom: 'notify_custom',
    };

    // ── Order granular check (must happen before generic typeMap)
    if (event.type === 'order') {
      const rawStatus = (event.metadata as any)?.status;
      const status = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : '';
      const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
      const prefs = await this.getPreferences();
      // Master switch: if orders completely disabled, skip everything order-related
      // For status changes we still require master ON? Only if you want master kill-switch.
      // Here we allow fine control: new-orders use notify_new_orders, status uses own key;
      // master is considered the "Orders" group toggle (which sets all). We do NOT double-gate status
      // behind notify_new_orders, so users can silence new orders while keeping status updates.
      if (status && validStatuses.includes(status)) {
        const subKey = `notify_order_${status}`;
        if (prefs[subKey] === false) {
          return { success: true, id: 'skipped' };
        }
        // status change does NOT require notify_new_orders to be ON — independent
        return this.create(event);
      }
      // Fallback: generic order (new order, deleted, updated without status, etc.)
      const prefKey = typeMap[event.type];
      if (prefKey && prefs[prefKey] === false) {
        return { success: true, id: 'skipped' };
      }
      return this.create(event);
    }

    const prefKey = typeMap[event.type];
    if (prefKey && !(await this.isEnabled(prefKey))) {
      return { success: true, id: 'skipped' };
    }

    return this.create(event);
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;



