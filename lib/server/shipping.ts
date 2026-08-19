/**
 * Server-side shipping service: city -> zone -> delivery methods -> fee.
 * No hard-coded prices; all reads come from the `shipping_zones` / `shipping_methods` tables.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ShippingZoneRow, ShippingMethodRow } from '@/lib/supabase/types';

export interface DeliveryOption {
  id: string;
  zoneId: string;
  zoneName: string;
  name: string;
  price: number;
  estimated_days: string;
  free_shipping_threshold: number | null;
}

export async function findZoneForCity(supabase: SupabaseClient, city: string): Promise<ShippingZoneRow | null> {
  const target = city.trim().toLowerCase();
  const { data: zones, error } = await supabase.from('shipping_zones').select('*');
  if (error) throw error;
  for (const zone of zones ?? []) {
    let cities: string[] = [];
    try {
      cities = typeof zone.cities === 'string' ? JSON.parse(zone.cities) : (zone.cities as string[]) ?? [];
    } catch { cities = []; }
    if (cities.some((c) => String(c).toLowerCase() === target)) return zone;
  }
  return null;
}

export async function getMethodsForCity(supabase: SupabaseClient, city: string): Promise<DeliveryOption[]> {
  const zone = await findZoneForCity(supabase, city);
  if (!zone) return [];
  const { data: methods, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('zone_id', zone.id)
    .order('price', { ascending: true });
  if (error) throw error;
  return (methods ?? []).map((m: ShippingMethodRow) => ({
    id: m.id,
    zoneId: m.zone_id,
    zoneName: zone.name,
    name: m.name,
    price: Number(m.price ?? 0),
    estimated_days: m.estimated_days,
    free_shipping_threshold: m.free_shipping_threshold,
  }));
}

/** Free when subtotal >= method threshold (or global cap), else method price. */
export function getDeliveryFee(method: DeliveryOption, subtotal: number, globalThreshold: number | null = null): number {
  const threshold = typeof method.free_shipping_threshold === 'number'
    ? method.free_shipping_threshold
    : globalThreshold;
  if (typeof threshold === 'number' && subtotal >= threshold) return 0;
  return Number(method.price) >= 0 ? Number(method.price) : 0;
}
