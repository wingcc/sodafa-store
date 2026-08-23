/**
 * Seed Notifications API
 * POST /api/admin/notifications/seed — Seeds sample notifications if table is empty
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError } from '@/lib/api';

const SEED_NOTIFICATIONS = [
  { type: 'order', title: 'New Order Received', message: 'Order #SOD-1001 has been placed by Ahmed Benali for 2,450 MAD.', priority: 'high', read: false },
  { type: 'order', title: 'Order Shipped', message: 'Order #SOD-0998 has been shipped via ZR Express.', priority: 'medium', read: false },
  { type: 'payment', title: 'Payment Confirmed', message: 'Payment of 1,890 MAD received for order #SOD-1000.', priority: 'high', read: false },
  { type: 'review', title: 'New 5-Star Review', message: 'Sara M. left a 5-star review on Hydra-Glow Serum.', priority: 'medium', read: false },
  { type: 'inventory', title: 'Low Stock Alert', message: 'Vitamin C Brightening Cream has only 3 units left.', priority: 'urgent', read: false },
  { type: 'shipping', title: 'Delivery Completed', message: 'Order #SOD-0995 was delivered to Casablanca.', priority: 'low', read: true },
  { type: 'customer', title: 'New Customer Registered', message: 'Youssef El Alami just created an account.', priority: 'low', read: true },
  { type: 'promotion', title: 'Flash Sale Active', message: 'Summer Sale 30% off is now live on all skincare products.', priority: 'medium', read: true },
  { type: 'system', title: 'System Update Complete', message: 'Dashboard has been updated to version 2.4.0.', priority: 'low', read: true },
  { type: 'security', title: 'Login from New Device', message: 'A new login was detected from Casablanca, Morocco.', priority: 'high', read: false },
  { type: 'order', title: 'Order Cancelled', message: 'Order #SOD-0992 was cancelled by the customer.', priority: 'medium', read: true },
  { type: 'product', title: 'Product Updated', message: 'Retinol Night Repair price has been updated to 890 MAD.', priority: 'low', read: true },
  { type: 'analytics', title: 'Weekly Report Ready', message: 'Your weekly sales report is ready. Revenue: 45,200 MAD.', priority: 'medium', read: false },
  { type: 'shipping', title: 'Delivery Failed', message: 'Delivery attempt for order #SOD-0988 failed. Customer not available.', priority: 'high', read: false },
  { type: 'payment', title: 'Refund Processed', message: 'Refund of 650 MAD issued for order #SOD-0985.', priority: 'medium', read: true },
];

export async function POST() {
  try {
    const admin = createAdminClient();

    // Check if notifications already exist
    const { count } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return successResponse({ message: `Database already has ${count} notifications. Skipped seeding.` });
    }

    // Insert seed notifications — only use base columns (type, title, message, read)
    // to avoid failures if migration 008 (priority, starred, metadata) wasn't applied
    const toInsert = SEED_NOTIFICATIONS.map((n) => ({
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
    }));

    const { data, error } = await admin
      .from('notifications')
      .insert(toInsert)
      .select();

    if (error) {
      console.error('Seed notifications error:', error);
      // If enum type fails, try inserting with just 'system' type as fallback
      const fallbackInsert = SEED_NOTIFICATIONS.map((n) => ({
        type: 'system',
        title: n.title,
        message: n.message,
        read: n.read,
      }));
      const { data: fallbackData, error: fallbackError } = await admin
        .from('notifications')
        .insert(fallbackInsert)
        .select();
      if (fallbackError) throw fallbackError;
      return successResponse({ message: `Seeded ${fallbackData?.length ?? 0} notifications (system type fallback).` });
    }

    return successResponse({ message: `Seeded ${data?.length ?? 0} notifications successfully.` });
  } catch (err: any) {
    console.error('POST /api/admin/notifications/seed error:', err);
    return internalServerError(err?.message ?? 'Failed to seed notifications');
  }
}
