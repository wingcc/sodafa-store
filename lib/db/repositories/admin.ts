/**
 * Admin User Repository
 * Database operations for admin users
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminUserInsert, AdminUserUpdate } from '@/lib/supabase/types';

export class AdminRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll() {
    return this.supabase.from('admin_users').select('*').order('name', { ascending: true });
  }

  async findById(id: string) {
    return this.supabase.from('admin_users').select('*').eq('id', id).single();
  }

  async findByEmail(email: string) {
    return this.supabase.from('admin_users').select('*').eq('email', email).single();
  }

  async create(admin: AdminUserInsert) {
    return this.supabase.from('admin_users').insert(admin).select().single();
  }

  async update(id: string, updates: AdminUserUpdate) {
    return this.supabase.from('admin_users').update(updates).eq('id', id).select().single();
  }

  async delete(id: string) {
    return this.supabase.from('admin_users').delete().eq('id', id);
  }

  async updateLastLogin(id: string) {
    return this.supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', id);
  }
}