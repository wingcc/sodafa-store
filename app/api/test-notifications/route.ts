import { createAdminClient } from '@/lib/supabase/admin';
import { notificationService } from '@/lib/services/notificationService';
import { NextResponse } from 'next/server';

// Map preference keys to notification types that can be tested
const PREF_TO_TYPE: Record<string, string> = {
  notify_new_orders: 'order',
  notify_order_status: 'order',
  // Order status sub-keys — each maps to order type but with distinct status payload
  notify_order_pending: 'order',
  notify_order_confirmed: 'order',
  notify_order_processing: 'order',
  notify_order_shipped: 'order',
  notify_order_delivered: 'order',
  notify_order_cancelled: 'order',
  notify_order_refunded: 'order',
  notify_low_stock: 'inventory',
  notify_out_of_stock: 'inventory',
  notify_new_reviews: 'review',
  notify_payments: 'payment',
  notify_payment_failed: 'payment',
  notify_refunds: 'payment',
  notify_product: 'product',
  notify_shipping: 'shipping',
  notify_promotion: 'promotion',
  notify_new_customers: 'customer',
  notify_security_events: 'security',
  notify_system_errors: 'system',
  notify_daily_reports: 'system',
};

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();
    const body = await request.json().catch(() => ({}));
    const type = body.type as string;
    const prefKey = body.preferenceKey as string;

    // Resolve type from preference key if provided
    const resolvedType = prefKey ? (PREF_TO_TYPE[prefKey] ?? type) : type;

    // Fetch real data from database
    const [ordersRes, productsRes, customersRes, reviewsRes, couponsRes, shippingRes] = await Promise.all([
      admin.from('orders').select('id, order_number, customer_name, total').limit(5).order('created_at', { ascending: false }),
      admin.from('products').select('id, name, sku, stock, low_stock_threshold').limit(5).order('created_at', { ascending: false }),
      admin.from('customers').select('id, name, email').limit(5).order('created_at', { ascending: false }),
      admin.from('reviews').select('id, product_name, customer_name, rating, comment').limit(5).order('created_at', { ascending: false }),
      admin.from('coupons').select('id, code, discount_type, discount_value').limit(5).order('created_at', { ascending: false }),
      admin.from('shipping_zones').select('id, name').limit(5).order('created_at', { ascending: false }),
    ]);

    const orders = ordersRes.data ?? [];
    const products = productsRes.data ?? [];
    const customers = customersRes.data ?? [];
    const reviews = reviewsRes.data ?? [];
    const coupons = couponsRes.data ?? [];
    const shipping = shippingRes.data ?? [];

    const results: string[] = [];

    const send = async (label: string, fn: Promise<any>) => {
      await fn;
      results.push(`✅ ${label}`);
    };

    const t = resolvedType;
    const isOrderSub = !!prefKey && prefKey.startsWith('notify_order_');

    if (!t || t === 'order') {
      if (orders[0]) {
        // If testing a specific order status sub-key (e.g. notify_order_shipped), send that status instead of generic new order
        if (isOrderSub) {
          const status = prefKey.replace('notify_order_', '').toLowerCase();
          const valid = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
          if (valid.includes(status)) {
            await send(`Order • ${status}`, notificationService.notifyOrderStatusChange(orders[0].id, orders[0].order_number, status));
          } else {
            await send('New Order', notificationService.notifyNewOrder(orders[0].id, orders[0].order_number, orders[0].customer_name, orders[0].total));
          }
        } else if (prefKey === 'notify_new_orders') {
          await send('New Order', notificationService.notifyNewOrder(orders[0].id, orders[0].order_number, orders[0].customer_name, orders[0].total));
        } else {
          // generic order test without prefKey → send new order as before
          await send('New Order', notificationService.notifyNewOrder(orders[0].id, orders[0].order_number, orders[0].customer_name, orders[0].total));
        }
      } else {
        results.push('⚠️ No orders found — skipped');
      }
    }

    if (!t || t === 'inventory') {
      if (products[0]) {
        await send('Low Stock', notificationService.notifyLowStock(products[0].id, products[0].name, products[0].stock ?? 5, 10));
      } else {
        results.push('⚠️ No products found — skipped');
      }
    }

    if (!t || t === 'customer') {
      if (customers[0]) {
        await send('New Customer', notificationService.notifyNewCustomer(customers[0].id, customers[0].name, customers[0].email));
      } else {
        results.push('⚠️ No customers found — skipped');
      }
    }

    if (!t || t === 'review') {
      if (reviews[0]) {
        await send('New Review', notificationService.notifyNewReview(reviews[0].id, reviews[0].product_name, reviews[0].customer_name, reviews[0].rating));
      } else {
        results.push('⚠️ No reviews found — skipped');
      }
    }

    if (!t || t === 'payment') {
      if (orders[0]) {
        await send('Payment Received', notificationService.notifyPaymentReceived(orders[0].id, orders[0].order_number, orders[0].total, 'cash_on_delivery'));
      } else {
        results.push('⚠️ No orders found — skipped');
      }
    }

    if (!t || t === 'promotion') {
      if (coupons[0]) {
        await send('Coupon Used', notificationService.notifyCouponUsed(coupons[0].id, coupons[0].code, orders[0]?.order_number ?? 'N/A', customers[0]?.name ?? 'Test Customer', coupons[0].discount_value ?? 0, coupons[0].discount_type));
      } else {
        results.push('⚠️ No coupons found — skipped');
      }
    }

    if (!t || t === 'shipping') {
      if (shipping[0]) {
        await send('Shipping Update', notificationService.create({ type: 'shipping', title: `Shipping Zone "${shipping[0].name}" Updated`, message: `Shipping zone "${shipping[0].name}" has been updated`, actionUrl: '/dashboard/shipping', metadata: { zoneId: shipping[0].id, name: shipping[0].name } }));
      } else {
        results.push('⚠️ No shipping zones found — skipped');
      }
    }

    if (!t || t === 'product') {
      if (products[0]) {
        await send('Product Update', notificationService.create({ type: 'product', title: `Product "${products[0].name}" Updated`, message: `Product "${products[0].name}" has been updated`, actionUrl: '/dashboard/products', metadata: { productId: products[0].id, productName: products[0].name, sku: products[0].sku } }));
      } else {
        results.push('⚠️ No products found — skipped');
      }
    }

    if (!t || t === 'system') {
      await send('System Update', notificationService.create({ type: 'system', title: 'System Update', message: 'System maintenance scheduled for tonight at 2:00 AM', actionUrl: '/dashboard/settings' }));
    }

    if (!t || t === 'security') {
      await send('Security Alert', notificationService.create({ type: 'security', priority: 'high', title: 'Security Alert', message: 'Multiple failed login attempts detected from unknown IP', actionUrl: '/dashboard/settings' }));
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Test notifications error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}