/**
 * Shipping Repository
 * Database operations for shipping zones and methods
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ShippingZoneInsert, ShippingZoneUpdate, ShippingMethodInsert, ShippingMethodUpdate } from '@/lib/supabase/types';

export class ShippingRepository {
  constructor(private supabase: SupabaseClient) {}

  // ─── Zones ──────────────────────────────────────────────────────

  async findAllZones() {
    return this.supabase.from('shipping_zones').select('*').order('name', { ascending: true });
  }

  async findZoneById(id: string) {
    return this.supabase.from('shipping_zones').select('*').eq('id', id).single();
  }

  async createZone(zone: ShippingZoneInsert) {
    return this.supabase.from('shipping_zones').insert(zone).select().single();
  }

  async updateZone(id: string, updates: ShippingZoneUpdate) {
    return this.supabase.from('shipping_zones').update(updates).eq('id', id).select().single();
  }

  async deleteZone(id: string) {
    return this.supabase.from('shipping_zones').delete().eq('id', id);
  }

  // ─── Methods ────────────────────────────────────────────────────

  async findAllMethods() {
    return this.supabase.from('shipping_methods').select('*').order('price', { ascending: true });
  }

  async findMethodsByZone(zoneId: string) {
    return this.supabase.from('shipping_methods').select('*').eq('zone_id', zoneId).order('price', { ascending: true });
  }

  async findMethodById(id: string) {
    return this.supabase.from('shipping_methods').select('*').eq('id', id).single();
  }

  async createMethod(method: ShippingMethodInsert) {
    return this.supabase.from('shipping_methods').insert(method).select().single();
  }

  async updateMethod(id: string, updates: ShippingMethodUpdate) {
    return this.supabase.from('shipping_methods').update(updates).eq('id', id).select().single();
  }

  async deleteMethod(id: string) {
    return this.supabase.from('shipping_methods').delete().eq('id', id);
  }
}