// Pure helpers derived from the shippingZones cache — no shipping logic duplicated.

import { normalizeCity } from '../../data/moroccoCities';
import type { ShippingZone, ShippingCity, ShippingMethod } from '../../types';
import { DEFAULT_METHODS, DEFAULT_CITY } from './types';
import type { CityStatus, MethodForm, ZoneForm, CityForm, ZonePayload, CityPayload, MethodPayload } from './types';

export function cityZone(name: string, zones: ShippingZone[]): ShippingZone | null {
  const target = normalizeCity(name);
  return zones.find((z) => z.cities.some((c) => normalizeCity(c.name) === target)) ?? null;
}

export function findCity(name: string, zones: ShippingZone[]): ShippingCity | null {
  const target = normalizeCity(name);
  for (const zone of zones) {
    const city = zone.cities.find((c) => normalizeCity(c.name) === target);
    if (city) return city;
  }
  return null;
}

export function zoneStatus(zone: ShippingZone | null): CityStatus {
  if (!zone) return 'none';
  if (zone.isActive === false) return 'disabled';
  // A zone is "configured" if it has cities with methods
  const activeCities = zone.cities.filter((c) => c.isActive !== false);
  const citiesWithMethods = activeCities.filter((c) => c.methods.length > 0);
  if (citiesWithMethods.length === 0) return 'none';
  // Check if at least one city has 2+ methods
  const fullyConfigured = citiesWithMethods.some((c) => c.methods.length >= 2);
  return fullyConfigured ? 'configured' : 'partial';
}

export function cityStatus(city: ShippingCity | null): CityStatus {
  if (!city) return 'none';
  if (city.isActive === false) return 'disabled';
  const n = city.methods.length;
  return n >= 2 ? 'configured' : n === 1 ? 'partial' : 'none';
}

export function methodOf(zone: ShippingZone | null, keyword: string): ShippingMethod | null {
  if (!zone) return null;
  // Search across all cities in the zone
  for (const city of zone.cities) {
    const found = city.methods.find((m) => m.name.toLowerCase().includes(keyword));
    if (found) return found;
  }
  return null;
}

export function methodsForCity(city: ShippingCity | null): ShippingMethod[] {
  if (!city) return [];
  return city.methods;
}

export function fmtPrice(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return `${isFinite(v) ? v.toFixed(2) : '0.00'} MAD`;
}

export function toZoneInput(form: ZoneForm): ZonePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    cities: form.cities.map((c) => ({
      ...(c.id ? { id: c.id } : {}),
      name: c.name.trim(),
      name_ar: c.nameAr.trim(),
      latitude: c.latitude === '' ? 0 : Number(c.latitude),
      longitude: c.longitude === '' ? 0 : Number(c.longitude),
      methods: c.methods.map((m) => ({
        ...(m.id ? { id: m.id } : {}),
        name: m.name.trim(),
        slug: m.slug.trim() || 'standard',
        price: m.price === '' ? 0 : Number(m.price),
        estimated_days: m.estimatedDays === '' ? 2 : Number(m.estimatedDays),
        estimated_hours: m.estimatedHours === '' ? null : Number(m.estimatedHours),
        description: m.description.trim(),
      })),
    })),
  };
}

export function zoneToForm(zone: ShippingZone | null): ZoneForm {
  const cities: CityForm[] = (zone?.cities ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    nameAr: c.nameAr,
    latitude: String(c.latitude ?? ''),
    longitude: String(c.longitude ?? ''),
        methods: c.methods.length
      ? c.methods.map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug ?? 'standard',
          price: String(m.price ?? 0),
          estimatedDays: String(m.estimatedDays ?? 2),
          estimatedHours: m.estimatedHours != null ? String(m.estimatedHours) : '',
          description: m.description ?? '',
        }))
      : DEFAULT_METHODS,
  }));
  return {
    name: zone?.name ?? '',
    description: zone?.description ?? '',
    cities: cities.length ? cities : [{ ...DEFAULT_CITY }],
  };
}
