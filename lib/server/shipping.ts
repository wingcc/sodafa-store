/**
 * Server-side shipping service: city -> zone -> delivery methods -> fee.
 * No hard-coded prices; all reads come from the `delivery_zones` /
 * `delivery_cities` / `delivery_methods` tables.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeliveryZoneRow, DeliveryCityRow, DeliveryMethodRow } from '@/lib/supabase/types';

export interface DeliveryOption {
  id: string;
  zoneId: string;
  zoneName: string;
  cityId: string;
  cityName: string;
  name: string;
  slug: string;
  price: number;
  estimated_days: number;
  estimated_hours: number | null;
  description: string;
}

export async function findCityRecord(supabase: SupabaseClient, city: string): Promise<DeliveryCityRow | null> {
  const { data, error } = await supabase
    .from('delivery_cities')
    .select('*')
    .ilike('name', city)
    .single();
  if (error || !data) return null;
  return data;
}

export async function findZoneForCity(supabase: SupabaseClient, city: string): Promise<DeliveryZoneRow | null> {
  const cityRecord = await findCityRecord(supabase, city);
  if (!cityRecord) return null;
  const { data: zone, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('id', cityRecord.zone_id)
    .single();
  if (error || !zone) return null;
  return zone;
}

export async function getMethodsForCity(supabase: SupabaseClient, city: string): Promise<DeliveryOption[]> {
  const cityRecord = await findCityRecord(supabase, city);
  if (!cityRecord) return [];

  const { data: zone } = await supabase
    .from('delivery_zones')
    .select('name')
    .eq('id', cityRecord.zone_id)
    .single();

  const { data: methods, error } = await supabase
    .from('delivery_methods')
    .select('*')
    .eq('city_id', cityRecord.id)
    .eq('is_active', true)
    .order('price', { ascending: true });
  if (error) throw error;

  return (methods ?? []).map((m: DeliveryMethodRow) => ({
    id: m.id,
    zoneId: m.zone_id,
    zoneName: zone?.name ?? '',
    cityId: cityRecord.id,
    cityName: cityRecord.name,
    name: m.name,
    slug: m.slug,
    price: Number(m.price ?? 0),
    estimated_days: m.estimated_days,
    estimated_hours: m.estimated_hours,
    description: m.description,
  }));
}

/** Free when subtotal >= method threshold (or global cap), else method price. */
export function getDeliveryFee(method: DeliveryOption, subtotal: number, globalThreshold: number | null = null): number {
  const threshold = globalThreshold;
  if (typeof threshold === 'number' && subtotal >= threshold) return 0;
  return Number(method.price) >= 0 ? Number(method.price) : 0;
}
