/**
 * Review Repository
 * Database operations for product reviews
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReviewInsert, ReviewUpdate } from '@/lib/supabase/types';

export class ReviewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(options?: {
    status?: string;
    productId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase.from('reviews').select('*');

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.productId) {
      query = query.eq('product_id', options.productId);
    }
    if (options?.search) {
      query = query.ilike('customer_name', `%${options.search}%`);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    return query.order('created_at', { ascending: false });
  }

  async findById(id: string) {
    return this.supabase.from('reviews').select('*').eq('id', id).single();
  }

  async findByProduct(productId: string) {
    return this.supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
  }

  async create(review: ReviewInsert) {
    return this.supabase.from('reviews').insert(review).select().single();
  }

  async update(id: string, updates: ReviewUpdate) {
    return this.supabase.from('reviews').update(updates).eq('id', id).select().single();
  }

  async moderate(id: string, status: 'approved' | 'rejected', adminReply?: string) {
    const updates: ReviewUpdate = { status };
    if (adminReply !== undefined) updates.admin_reply = adminReply;
    return this.supabase.from('reviews').update(updates).eq('id', id).select().single();
  }

  async delete(id: string) {
    return this.supabase.from('reviews').delete().eq('id', id);
  }

  async getStats() {
    const { data: all, error } = await this.supabase.from('reviews').select('status');
    if (error) return { data: null, error };

    return {
      data: {
        total: all.length,
        pending: all.filter(r => r.status === 'pending').length,
        approved: all.filter(r => r.status === 'approved').length,
        rejected: all.filter(r => r.status === 'rejected').length,
      },
      error: null,
    };
  }
}