/**
 * Dashboard Analytics API
 * GET /api/dashboard/analytics  — Get analytics data
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { OrderRepository } from '@/lib/db';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET() {
  try {
    const admin = createAdminClient();
    const repo = new OrderRepository(admin);

    const { data: orders, error } = await repo.findAll({ limit: 500 });

    if (error) throw error;

    // Revenue by day (last 7 days)
    const last7Days: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7Days[key] = { revenue: 0, orders: 0 };
    }

    const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
    for (const order of orders ?? []) {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (last7Days[date] !== undefined) {
        last7Days[date].revenue += order.total;
        last7Days[date].orders += 1;
      }
    }

    for (const [date, stats] of Object.entries(last7Days)) {
      revenueByDay.push({ date, ...stats });
    }

    return successResponse({
      revenueByDay,
      totalOrders: orders?.length ?? 0,
    });
  } catch (err: any) {
    console.error('GET /api/dashboard/analytics error:', err);
    return internalServerError(err.message);
  }
}