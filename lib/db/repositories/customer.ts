/**
 * Customer Repository
 * Database operations for customers and addresses
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CustomerInsert, CustomerUpdate, CustomerAddressInsert, CustomerAddressUpdate } from '@/lib/supabase/types';

export class CustomerRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(options?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase.from('customers').select('*');

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    query = query.order('registered_at', { ascending: false });
    return query;
  }

  async findById(id: string) {
    return this.supabase.from('customers').select('*').eq('id', id).single();
  }

  async findByEmail(email: string) {
    return this.supabase.from('customers').select('*').eq('email', email).single();
  }

  async create(customer: CustomerInsert) {
    return this.supabase.from('customers').insert(customer).select().single();
  }

  async update(id: string, updates: CustomerUpdate) {
    return this.supabase.from('customers').update(updates).eq('id', id).select().single();
  }

  async delete(id: string) {
    return this.supabase.from('customers').delete().eq('id', id);
  }

  // ─── Addresses ──────────────────────────────────────────────────

  async findAddresses(customerId: string) {
    return this.supabase.from('customer_addresses').select('*').eq('customer_id', customerId);
  }

  async createAddress(address: CustomerAddressInsert) {
    return this.supabase.from('customer_addresses').insert(address).select().single();
  }

  async updateAddress(id: string, updates: CustomerAddressUpdate) {
    return this.supabase.from('customer_addresses').update(updates).eq('id', id).select().single();
  }

  async deleteAddress(id: string) {
    return this.supabase.from('customer_addresses').delete().eq('id', id);
  }

  // ─── Stats ──────────────────────────────────────────────────────

  async getStats() {
    const { data: all, error } = await this.supabase.from('customers').select('status, registered_at');
    if (error) return { data: null, error };

    const total = all.length;
    const active = all.filter(c => c.status === 'active').length;
    const newThisMonth = all.filter(c => {
      const d = new Date(c.registered_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { data: { total, active, newThisMonth }, error: null };
  }
}