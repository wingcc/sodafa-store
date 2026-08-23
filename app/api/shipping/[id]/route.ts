/**
 * Single Shipping Zone API
 * GET    /api/shipping/[id]  — Get zone with cities and methods
 * PUT    /api/shipping/[id]  — Update zone + sync cities and methods (admin)
 * DELETE /api/shipping/[id]  — Delete zone (admin, cities cascade via FK)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ShippingRepository } from '@/lib/db';
import { successResponse, internalServerError, notFound } from '@/lib/api';
import type { DeliveryZoneUpdate } from '@/lib/supabase/types';

interface MethodBody {
  id?: string;
  city_id: string;
  name: string;
  slug?: string;
  price?: number;
  estimated_days?: number;
  estimated_hours?: number | null;
  description?: string;
  isActive?: boolean;
}

interface CityBody {
  id?: string;
  name: string;
  name_ar?: string;
  latitude?: number;
  longitude?: number;
  methods?: MethodBody[];
}

interface ZoneBody {
  name?: string;
  description?: string;
  is_active?: boolean;
  city_ids?: string[];
  cities?: CityBody[];
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const repo = new ShippingRepository(supabase);

    const { data: zone, error } = await repo.findZoneById(id);
    if (error) throw error;
    if (!zone) return notFound('Delivery zone not found');

    const { data: cities } = await repo.findCitiesByZone(id);
    const citiesWithMethods = await Promise.all(
      (cities ?? []).map(async (city) => {
        const { data: methods } = await repo.findMethodsByCity(city.id);
        return { ...city, methods: methods ?? [] };
      })
    );

    return successResponse({ ...zone, cities: citiesWithMethods });
  } catch (err: unknown) {
    console.error('GET /api/shipping/[id] error:', err);
    return internalServerError(toErrorMessage(err));
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as ZoneBody;
    const admin = createAdminClient();
    const repo = new ShippingRepository(admin);

    const { data: existing, error: findErr } = await repo.findZoneById(id);
    if (findErr) throw findErr;
    if (!existing) return notFound('Delivery zone not found');

    // Update zone metadata
    const zoneUpdates: DeliveryZoneUpdate = {};
    if (body.name !== undefined) zoneUpdates.name = body.name;
    if (body.description !== undefined) zoneUpdates.description = body.description;
    if (body.is_active !== undefined) zoneUpdates.is_active = body.is_active;

    const { data: updatedZone, error: updErr } = await repo.updateZone(id, zoneUpdates);
    if (updErr) throw updErr;

    // Handle city_ids — simple reassignment of existing cities to this zone
    if (Array.isArray(body.city_ids)) {
      const { data: currentCities } = await repo.findCitiesByZone(id);
      const currentIds = new Set((currentCities ?? []).map((c: { id: string }) => c.id));
      const incomingIds = new Set(body.city_ids);

      // Remove cities no longer in the list (move them out of this zone)
      for (const cityId of currentIds) {
        if (!incomingIds.has(cityId)) {
          await repo.updateCity(cityId, { zone_id: '' });
        }
      }

      // Assign incoming cities to this zone
      for (const cityId of body.city_ids) {
        await repo.updateCity(cityId, { zone_id: id });
      }
    }

    // Sync cities if provided (full city objects with methods)
    if (Array.isArray(body.cities)) {
      const { data: currentCities } = await repo.findCitiesByZone(id);
      const current = (currentCities ?? []) as Array<{ id: string }>;
      const incomingCityIds = new Set<string>();

      for (const city of body.cities) {
        if (city.id) {
          incomingCityIds.add(city.id);
          // Update existing city
          const { error: cErr } = await repo.updateCity(city.id, {
            name: city.name,
            name_ar: city.name_ar,
            latitude: city.latitude,
            longitude: city.longitude,
          });
          if (cErr) throw cErr;

          // Sync methods for this city
          if (Array.isArray(city.methods)) {
            const { data: currentMethods } = await repo.findMethodsByCity(city.id);
            const currentM = (currentMethods ?? []) as Array<{ id: string }>;
            const incomingMethodIds = new Set<string>();

            for (const method of city.methods) {
              const methodPayload = {
                city_id: city.id,
                zone_id: id,
                name: method.name,
                slug: method.slug ?? 'standard',
                price: Number(method.price ?? 0),
                estimated_days: Number(method.estimated_days ?? 2),
                estimated_hours: method.estimated_hours ?? null,
                description: method.description ?? '',
                ...(method.isActive !== undefined ? { is_active: Boolean(method.isActive) } : {}),
              };

              if (method.id) {
                incomingMethodIds.add(method.id);
                const { error: mErr } = await repo.updateMethod(method.id, methodPayload);
                if (mErr) throw mErr;
              } else {
                const { error: mErr } = await repo.createMethod(methodPayload);
                if (mErr) throw mErr;
              }
            }

            // Remove methods not in incoming list
            for (const m of currentM) {
              if (!incomingMethodIds.has(m.id)) {
                const { error: delErr } = await repo.deleteMethod(m.id);
                if (delErr) throw delErr;
              }
            }
          }
        } else {
          // Create new city
          const { data: newCity, error: cErr } = await repo.createCity({
            name: city.name,
            name_ar: city.name_ar ?? '',
            zone_id: id,
            latitude: city.latitude ?? 0,
            longitude: city.longitude ?? 0,
          });
          if (cErr) throw cErr;
          if (newCity) incomingCityIds.add(newCity.id);

          // Create methods for new city
          if (Array.isArray(city.methods) && newCity) {
            for (const method of city.methods) {
              const { error: mErr } = await repo.createMethod({
                city_id: newCity.id,
                zone_id: id,
                name: method.name,
                slug: method.slug ?? 'standard',
                price: Number(method.price ?? 0),
                estimated_days: Number(method.estimated_days ?? 2),
                estimated_hours: method.estimated_hours ?? null,
                description: method.description ?? '',
              });
              if (mErr) throw mErr;
            }
          }
        }
      }

      // Remove cities not in incoming list (cascades methods via FK)
      for (const c of current) {
        if (!incomingCityIds.has(c.id)) {
          const { error: delErr } = await repo.deleteCity(c.id);
          if (delErr) throw delErr;
        }
      }
    }

    // Re-fetch latest
    const { data: cities } = await repo.findCitiesByZone(id);
    const citiesWithMethods = await Promise.all(
      (cities ?? []).map(async (city) => {
        const { data: methods } = await repo.findMethodsByCity(city.id);
        return { ...city, methods: methods ?? [] };
      })
    );

    return successResponse({ ...updatedZone, cities: citiesWithMethods });
  } catch (err: unknown) {
    console.error('PUT /api/shipping/[id] error:', err);
    return internalServerError(toErrorMessage(err));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const repo = new ShippingRepository(admin);

    const { error } = await repo.deleteZone(id);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: unknown) {
    console.error('DELETE /api/shipping/[id] error:', err);
    return internalServerError(toErrorMessage(err));
  }
}
