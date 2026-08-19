/**
 * Store Settings Repository
 * Database operations for store configuration
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { StoreSettingRow } from '@/lib/supabase/types';

export class SettingsRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll() {
    return this.supabase.from('store_settings').select('*').order('key', { ascending: true });
  }

  async findByKey(key: string) {
    return this.supabase.from('store_settings').select('*').eq('key', key).single();
  }

  async set(key: string, value: string) {
    const { data: existing } = await this.supabase
      .from('store_settings')
      .select('id')
      .eq('key', key)
      .single();

    if (existing) {
      return this.supabase.from('store_settings').update({ value }).eq('key', key).select().single();
    } else {
      return this.supabase.from('store_settings').insert({ key, value }).select().single();
    }
  }

  async upsert(settings: Record<string, string>) {
    const results: StoreSettingRow[] = [];
    const errors: Error[] = [];

    for (const [key, value] of Object.entries(settings)) {
      const { data, error } = await this.set(key, value);
      if (error) errors.push(error);
      if (data) results.push(data);
    }

    return { data: results, error: errors.length > 0 ? errors[0] : null };
  }
}