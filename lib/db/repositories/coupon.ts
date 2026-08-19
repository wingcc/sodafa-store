/**
 * Coupon Repository
 * Database operations for coupons/discount codes
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CouponInsert, CouponUpdate } from '@/lib/supabase/types';

export class CouponRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase.from('coupons').select('*');

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.search) {
      query = query.or(`code.ilike.%${options.search}%,description.ilike.%${options.search}%`);
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
    return this.supabase.from('coupons').select('*').eq('id', id).single();
  }

  async findByCode(code: string) {
    return this.supabase.from('coupons').select('*').eq('code', code.toUpperCase()).single();
  }

  async create(coupon: CouponInsert) {
    return this.supabase.from('coupons').insert(coupon).select().single();
  }

  async update(id: string, updates: CouponUpdate) {
    return this.supabase.from('coupons').update(updates).eq('id', id).select().single();
  }

  async delete(id: string) {
    return this.supabase.from('coupons').delete().eq('id', id);
  }

  async incrementUsage(id: string) {
    return this.supabase.rpc('increment_coupon_usage', { coupon_id: id });
  }
}