import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const logs: any[] = [];

    // Fetch orders as activity
    const { data: orders } = await supabase.from('orders').select('id, order_number, customer_name, total, order_status, payment_status, created_at').order('created_at', { ascending: false }).limit(30);
    for (const o of orders || []) {
      logs.push({
        id: `order-${o.id}`,
        category: 'orders',
        type: 'order_created',
        title: `Order Created ${o.order_number}`,
        description: `${o.customer_name || 'Customer'} • ${o.total} MAD • ${o.order_status}`,
        user: o.customer_name || 'Customer',
        timestamp: o.created_at,
        entity: 'Order',
        entityId: o.order_number,
        status: o.order_status,
        severity: o.order_status === 'cancelled' ? 'error' : o.order_status === 'refunded' ? 'warning' : 'success',
        metadata: { total: o.total, payment: o.payment_status, status: o.order_status },
      });
    }

    // Products
    const { data: products } = await supabase.from('products').select('id, name, stock, status, created_at, updated_at').order('updated_at', { ascending: false }).limit(20);
    for (const p of products || []) {
      const isNew = p.created_at === p.updated_at;
      logs.push({
        id: `product-${p.id}-${p.updated_at}`,
        category: 'products',
        type: isNew ? 'product_created' : 'product_updated',
        title: isNew ? `Product Created ${p.name}` : `Product Updated ${p.name}`,
        description: `Stock: ${p.stock} • Status: ${p.status}`,
        user: 'Admin',
        timestamp: p.updated_at || p.created_at,
        entity: 'Product',
        entityId: p.name,
        status: p.status,
        severity: p.stock === 0 ? 'warning' : 'info',
        metadata: { stock: p.stock, status: p.status },
      });
    }

    // Customers
    const { data: customers } = await supabase.from('customers').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(15);
    for (const c of customers || []) {
      logs.push({
        id: `customer-${c.id}`,
        category: 'customers',
        type: 'customer_created',
        title: `Customer Created ${c.name}`,
        description: c.email,
        user: c.name,
        timestamp: c.created_at,
        entity: 'Customer',
        entityId: c.email,
        status: 'active',
        severity: 'info',
        metadata: { email: c.email },
      });
    }

    // Notifications as system logs (recent 20)
    const { data: notifs } = await supabase.from('notifications').select('id, type, title, message, priority, created_at, metadata').order('created_at', { ascending: false }).limit(20);
    for (const n of notifs || []) {
      logs.push({
        id: `notif-${n.id}`,
        category: (['order','payment','product','stock','inventory'].includes(n.type) ? n.type + 's' : 'system') as any,
        type: n.type,
        title: n.title,
        description: n.message,
        user: 'System',
        timestamp: n.created_at,
        entity: n.type,
        entityId: n.id,
        status: n.priority,
        severity: n.priority === 'urgent' ? 'critical' : n.priority === 'high' ? 'warning' : 'info',
        metadata: n.metadata,
      });
    }

    // Sort by timestamp desc
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const sliced = logs.slice(0, limit);

    return NextResponse.json({ success: true, data: sliced, total: logs.length });
  } catch (e) {
    console.error('[activity] error', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch activity' }, { status: 500 });
  }
}
