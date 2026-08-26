/**
 * Payments API
 * GET /api/payments — List payments (from orders table) with stats
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    // Fetch orders with payment data
    let query = admin
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        subtotal,
        discount,
        shipping_cost,
        total,
        currency,
        payment_method,
        payment_status,
        order_status,
        delivery_method,
        coupon_code,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('payment_status', status);
    }
    if (method) {
      query = query.eq('payment_method', method);
    }
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
      );
    }

    const { data: orders, error } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    // Get total count for pagination
    let countQuery = admin.from('orders').select('id', { count: 'exact', head: true });
    if (status) countQuery = countQuery.eq('payment_status', status);
    if (method) countQuery = countQuery.eq('payment_method', method);
    if (search) {
      countQuery = countQuery.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
      );
    }
    const { count } = await countQuery;

    // Compute stats from ALL orders (not filtered)
    const { data: allOrders } = await admin
      .from('orders')
      .select('total, payment_status, payment_method, payment_status');

    const stats = {
      totalPaid: 0,
      totalPending: 0,
      totalFailed: 0,
      totalRefunded: 0,
      countPaid: 0,
      countPending: 0,
      countFailed: 0,
      countRefunded: 0,
      methodCounts: {} as Record<string, number>,
    };

    if (allOrders) {
      for (const o of allOrders) {
        const amt = Number(o.total) || 0;
        switch (o.payment_status) {
          case 'paid':
            stats.totalPaid += amt;
            stats.countPaid++;
            break;
          case 'pending':
            stats.totalPending += amt;
            stats.countPending++;
            break;
          case 'failed':
            stats.totalFailed += amt;
            stats.countFailed++;
            break;
          case 'refunded':
            stats.totalRefunded += amt;
            stats.countRefunded++;
            break;
        }
        const method = (o.payment_method ?? 'unknown').replace(/_/g, ' ');
        stats.methodCounts[method] = (stats.methodCounts[method] ?? 0) + 1;
      }
    }

    return successResponse({
      payments: orders ?? [],
      stats,
      total: count ?? 0,
    });
  } catch (err: any) {
    console.error('GET /api/payments error:', err);
    return internalServerError(err.message);
  }
}
