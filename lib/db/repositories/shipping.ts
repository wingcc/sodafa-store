/**
 * Delivery Repository
 * Database operations for delivery zones, cities, and methods
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DeliveryZoneInsert, DeliveryZoneUpdate,
  DeliveryCityInsert, DeliveryCityUpdate,
  DeliveryMethodInsert, DeliveryMethodUpdate,
} from '@/lib/supabase/types';

export class ShippingRepository {
  constructor(private supabase: SupabaseClient) {}

  // ─── Zones ──────────────────────────────────────────────────────

  async findAllZones() {
    return this.supabase.from('delivery_zones').select('*').order('name', { ascending: true });
  }

  async findZoneById(id: string) {
    return this.supabase.from('delivery_zones').select('*').eq('id', id).single();
  }

  async createZone(zone: DeliveryZoneInsert) {
    return this.supabase.from('delivery_zones').insert(zone).select().single();
  }

  async updateZone(id: string, updates: DeliveryZoneUpdate) {
    return this.supabase.from('delivery_zones').update(updates).eq('id', id).select().single();
  }

  async deleteZone(id: string) {
    return this.supabase.from('delivery_zones').delete().eq('id', id);
  }

  // ─── Cities ─────────────────────────────────────────────────────

  async findAllCities() {
    return this.supabase.from('delivery_cities').select('*').order('name', { ascending: true });
  }

  async findCitiesByZone(zoneId: string) {
    return this.supabase.from('delivery_cities').select('*').eq('zone_id', zoneId).order('name', { ascending: true });
  }

  async findCityById(id: string) {
    return this.supabase.from('delivery_cities').select('*').eq('id', id).single();
  }

  async findCityByName(name: string) {
    return this.supabase.from('delivery_cities').select('*').ilike('name', name).single();
  }

  async createCity(city: DeliveryCityInsert) {
    return this.supabase.from('delivery_cities').insert(city).select().single();
  }

  async updateCity(id: string, updates: DeliveryCityUpdate) {
    return this.supabase.from('delivery_cities').update(updates).eq('id', id).select().single();
  }

  async deleteCity(id: string) {
    return this.supabase.from('delivery_cities').delete().eq('id', id);
  }

  // ─── Methods ────────────────────────────────────────────────────

  async findAllMethods() {
    return this.supabase.from('delivery_methods').select('*').order('price', { ascending: true });
  }

  async findMethodsByZone(zoneId: string) {
    return this.supabase.from('delivery_methods').select('*').eq('zone_id', zoneId).order('price', { ascending: true });
  }

  async findMethodsByCity(cityId: string) {
    return this.supabase.from('delivery_methods').select('*').eq('city_id', cityId).order('price', { ascending: true });
  }

  async findMethodById(id: string) {
    return this.supabase.from('delivery_methods').select('*').eq('id', id).single();
  }

  async createMethod(method: DeliveryMethodInsert) {
    return this.supabase.from('delivery_methods').insert(method).select().single();
  }

  async updateMethod(id: string, updates: DeliveryMethodUpdate) {
    return this.supabase.from('delivery_methods').update(updates).eq('id', id).select().single();
  }

  async deleteMethod(id: string) {
    return this.supabase.from('delivery_methods').delete().eq('id', id);
  }

  async deleteMethodsByCity(cityId: string) {
    return this.supabase.from('delivery_methods').delete().eq('city_id', cityId);
  }

  async deleteMethodsByZone(zoneId: string) {
    return this.supabase.from('delivery_methods').delete().eq('zone_id', zoneId);
  }
}
