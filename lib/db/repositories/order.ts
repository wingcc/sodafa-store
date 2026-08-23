/**
 * Order Repository
 * Database operations for orders, items, and timeline
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrderInsert, OrderUpdate, OrderItemInsert, OrderTimelineInsert } from '@/lib/supabase/types';

export class OrderRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(options?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    customerId?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase.from('orders').select('*, items:order_items(*)');

    if (options?.status) {
      query = query.eq('order_status', options.status);
    }
    if (options?.paymentStatus) {
      query = query.eq('payment_status', options.paymentStatus);
    }
    if (options?.customerId) {
      query = query.eq('customer_id', options.customerId);
    }
    if (options?.search) {
      query = query.or(
        `order_number.ilike.%${options.search}%,customer_name.ilike.%${options.search}%`
      );
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    query = query.order('created_at', { ascending: false });
    return query;
  }

  async findById(id: string) {
    return this.supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single();
  }

  async findByOrderNumber(orderNumber: string) {
    return this.supabase.from('orders').select('*, items:order_items(*)').eq('order_number', orderNumber).single();
  }

  async create(order: OrderInsert) {
    return this.supabase.from('orders').insert(order).select().single();
  }

  async update(id: string, updates: OrderUpdate) {
    return this.supabase.from('orders').update(updates).eq('id', id).select().single();
  }

  async updateStatus(id: string, status: string, note?: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ order_status: status as any })
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await this.supabase.from('order_timeline').insert({
        order_id: id,
        status: status as any,
        note: note ?? null,
      });
    }

    return { data, error };
  }

  async delete(id: string) {
    return this.supabase.from('orders').delete().eq('id', id);
  }

  // ─── Order Items ────────────────────────────────────────────────

  async findItems(orderId: string) {
    return this.supabase.from('order_items').select('*').eq('order_id', orderId);
  }

  async addItem(item: OrderItemInsert) {
    return this.supabase.from('order_items').insert(item).select().single();
  }

  // ─── Order Timeline ─────────────────────────────────────────────

  async findTimeline(orderId: string) {
    return this.supabase
      .from('order_timeline')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: true });
  }

  async addTimelineEvent(event: OrderTimelineInsert) {
    return this.supabase.from('order_timeline').insert(event).select().single();
  }

  // ─── Stats ──────────────────────────────────────────────────────

  async getStats() {
    const { data: orders, error } = await this.supabase.from('orders').select('total, order_status');
    if (error) return { data: null, error };

    const total = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter(o => o.order_status === 'pending').length;
    const completed = orders.filter(o => o.order_status === 'delivered').length;
    const cancelled = orders.filter(o => o.order_status === 'cancelled').length;

    return { data: { total, totalRevenue, pending, completed, cancelled }, error: null };
  }

  // ─── Dashboard Stats ────────────────────────────────────────────

  async getDashboardStats() {
    const { data, error } = await this.supabase.from('orders').select('*');
    if (error) return { data: null, error };

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayRevenue = data
      .filter(o => new Date(o.created_at).toDateString() === today.toDateString())
      .reduce((sum, o) => sum + o.total, 0);

    const monthlyRevenue = data
      .filter(o => new Date(o.created_at) >= monthStart)
      .reduce((sum, o) => sum + o.total, 0);

    const totalRevenue = data.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = data.length;
    const pendingOrders = data.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length;

    return {
      data: { todayRevenue, monthlyRevenue, totalRevenue, totalOrders, pendingOrders },
      error: null,
    };
  }
}