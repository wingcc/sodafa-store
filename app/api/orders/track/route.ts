/**
 * Track Order API
 * GET /api/orders/track?orderNumber=SDF-XXXXXXX-ABCDEF
 *
 * Public endpoint for guest order tracking.
 * Uses the service-role (admin) client so Row Level Security
 * does NOT block anonymous lookups — guests can search by order
 * number without being authenticated.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { badRequest, internalServerError, notFound, successResponse } from '@/lib/api';
import type { OrderTrackingData } from '@/lib/order-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return badRequest('Order number is required');
    }

    const supabase = createAdminClient();

    // Single query with nested relations (bypasses RLS via service-role key)
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), order_timeline(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      console.error('Track order error:', error?.message ?? 'No data returned');
      return notFound('No order found with this number');
    }

    // Build timeline – if not stored in order_timeline, generate from statuses
    const storedTimeline = order.order_timeline || [];
    const timeline: OrderTrackingData['timeline'] = storedTimeline.length
      ? storedTimeline.map((event: { status: string; timestamp: string; note: string | null }) => ({
          status: event.status,
          timestamp: event.timestamp,
          note: event.note || undefined,
        }))
      : [
          { status: 'pending', timestamp: order.created_at, note: 'Order placed' },
          ...(order.order_status === 'confirmed'
            ? [{ status: 'confirmed', timestamp: order.updated_at, note: 'Order confirmed' }]
            : []),
          ...(order.order_status === 'processing'
            ? [{ status: 'processing', timestamp: order.updated_at, note: 'Order is being processed' }]
            : []),
          ...(order.order_status === 'shipped'
            ? [{ status: 'shipped', timestamp: order.updated_at, note: 'Order has been shipped' }]
            : []),
          ...(order.order_status === 'delivered'
            ? [{ status: 'delivered', timestamp: order.updated_at, note: 'Order delivered' }]
            : []),
        ];

    // Parse shipping address (stored as JSONB)
    const rawAddress = order.shipping_address || {};
    const address = typeof rawAddress === 'string' ? JSON.parse(rawAddress) : rawAddress;

    const trackingData: OrderTrackingData = {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      items: (order.order_items || []).map((item: {
        product_name: string;
        quantity: number;
        total: number;
        unit_price: number;
        product_id: string | null;
        product_image: string;
      }) => ({
        productName: item.product_name,
        quantity: item.quantity,
        total: Number(item.total) || 0,
        unitPrice: Number(item.unit_price) || 0,
        productId: item.product_id ?? undefined,
        image: item.product_image || undefined,
      })),
      subtotal: Number(order.subtotal) || 0,
      discount: Number(order.discount) || 0,
      shippingCost: Number(order.shipping_cost) || 0,
      total: Number(order.total) || 0,
      orderStatus: order.order_status as OrderTrackingData['orderStatus'],
      paymentStatus: order.payment_status as OrderTrackingData['paymentStatus'],
      paymentMethod: order.payment_method,
      deliveryMethod: order.delivery_method,
      couponCode: order.coupon_code,
      trackingNumber: order.tracking_number,
      shippingProvider: order.shipping_provider,
      notes: order.notes,
      shippingAddress: {
        city: address.city || '',
        address: address.address || '',
        name: address.name || order.customer_name,
        phone: address.phone || order.customer_phone,
        email: address.email || order.customer_email,
      },
      createdAt: order.created_at,
      timeline,
    };

    return successResponse(trackingData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/orders/track error:', message);
    return internalServerError(message);
  }
}
