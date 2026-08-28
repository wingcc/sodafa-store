/**
 * Notification Preferences API
 * GET /api/admin/notifications/preferences  — Get notification preferences
 * PUT /api/admin/notifications/preferences  — Update notification preferences
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

const PREFERENCE_KEYS = [
  'notify_new_orders',
  'notify_low_stock',
  'notify_new_reviews',
  'notify_payments',
  'notify_daily_reports',
  'notify_system_errors',
  'notify_security_events',
  'notify_new_customers',
  // New UI types (008 + 009) — 12 + 10 = 22 total (20 canonical + 2 legacy aliases)
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
  // ── Order status sub-preferences (granular order controls) — parent is notify_new_orders, children expand in Settings
  'notify_order_pending',
  'notify_order_confirmed',
  'notify_order_processing',
  'notify_order_shipped',
  'notify_order_delivered',
  'notify_order_cancelled',
  'notify_order_refunded',
];

const DEFAULT_PREFERENCES = {
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
  // Order status sub-flags — default ON so existing installs stay noisy until user customizes
  notify_order_pending: true,
  notify_order_confirmed: true,
  notify_order_processing: true,
  notify_order_shipped: true,
  notify_order_delivered: true,
  notify_order_cancelled: true,
  notify_order_refunded: true,
};

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('store_settings')
      .select('key, value')
      .in('key', PREFERENCE_KEYS);

    // If table doesn't exist or query fails, return defaults silently
    if (error) {
      const msg = (error as any)?.message ?? '';
      if (/does not exist|relation.*does not exist|42P01/i.test(msg)) {
        return successResponse(DEFAULT_PREFERENCES);
      }
      throw error;
    }

    const preferences = { ...DEFAULT_PREFERENCES };
    if (data && Array.isArray(data)) {
      for (const item of data) {
        preferences[item.key as keyof typeof preferences] = item.value === 'true';
      }
    }

    return successResponse(preferences);
  } catch (err: any) {
    console.error('GET /api/admin/notifications/preferences error:', err);
    // Return defaults on any error rather than 500
    return successResponse(DEFAULT_PREFERENCES);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();

    // Validate that only known preference keys are updated
    const updates: Record<string, string> = {};
    for (const key of PREFERENCE_KEYS) {
      if (key in body) {
        updates[key] = body[key] === true ? 'true' : 'false';
      }
    }

    if (Object.keys(updates).length === 0) {
      return badRequest('No valid preference keys provided');
    }

    // Upsert each preference — handle missing table gracefully
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        admin.from('store_settings').upsert({ key, value }, { onConflict: 'key' })
      )
    );

    // Check for errors (ignore missing table)
    for (const result of results) {
      if (result.error) {
        const msg = (result.error as any)?.message ?? '';
        if (!/does not exist|relation.*does not exist|42P01/i.test(msg)) {
          throw result.error;
        }
      }
    }

    return successResponse({ ...DEFAULT_PREFERENCES, ...body });
  } catch (err: any) {
    console.error('PUT /api/admin/notifications/preferences error:', err);
    return internalServerError(err.message);
  }
}
