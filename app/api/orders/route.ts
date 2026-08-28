/**
 * Orders API
 * GET  /api/orders        — List orders (admin)
 * POST /api/orders        — Create order (public)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { OrderRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new OrderRepository(admin);

    const { data, error } = await repo.findAll({
      status: searchParams.get('status') ?? undefined,
      paymentStatus: searchParams.get('paymentStatus') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      customerId: searchParams.get('customerId') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      offset: Number(searchParams.get('offset')) || undefined,
    });

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/orders error:', err);
    return internalServerError(err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Use admin client (bypasses RLS) — anon/RLS blocks guest order inserts
    const admin = createAdminClient();
    const repo = new OrderRepository(admin);

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return badRequest('Order must contain at least one item');
    }
    if (!body.total) {
      return badRequest('Total is required');
    }

    const { data: order, error } = await repo.create({
      customer_id: body.customerId ?? null,
      customer_name: body.customerName ?? 'Guest',
      customer_email: body.customerEmail ?? '',
      customer_phone: body.customerPhone ?? '',
      subtotal: body.subtotal ?? body.total,
      discount: body.discount ?? 0,
      shipping_cost: body.shippingCost ?? 0,
      total: body.total,
      payment_method: body.paymentMethod ?? 'cash_on_delivery',
      shipping_address: body.shippingAddress ?? {},
      billing_address: body.billingAddress ?? {},
      notes: body.notes ?? null,
    });

    if (error) throw error;

    // Add order items
    if (order) {
      for (const item of body.items) {
        await repo.addItem({
          order_id: order.id,
          product_id: item.productId ?? null,
          product_name: item.productName || 'Product',
          product_image: item.productImage ?? '',
          variant: item.variant ?? null,
          quantity: item.quantity ?? 1,
          unit_price: item.unitPrice ?? item.price ?? 0,
          total: item.total ?? (item.quantity ?? 1) * (item.unitPrice ?? item.price ?? 0),
        });
      }

      // Create initial timeline event for pending
      await repo.addTimelineEvent({
        order_id: order.id,
        status: 'pending' as any,
        note: null,
      });

      // Create notification for new order
      await notificationService.notifyNewOrder(
        order.id,
        order.order_number,
        order.customer_name,
        order.total
      );
    }

    return successResponse(order, 201);
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return internalServerError(err.message);
  }
}