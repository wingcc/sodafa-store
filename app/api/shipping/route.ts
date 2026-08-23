/**
 * Shipping API
 * GET  /api/shipping        — List zones with cities and methods
 * POST /api/shipping        — Create zone/city/method (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ShippingRepository } from '@/lib/db';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

interface CreateZoneBody {
  type: 'zone';
  name: string;
  description?: string;
  city_ids?: string[];
}

interface CreateCityBody {
  type: 'city';
  zone_id: string;
  name: string;
  name_ar?: string;
  latitude?: number;
  longitude?: number;
}

interface CreateMethodBody {
  type: 'method';
  city_id: string;
  zone_id: string;
  name: string;
  slug?: string;
  price?: number;
  estimated_days?: number;
  estimated_hours?: number | null;
  description?: string;
}

type CreateBody = CreateZoneBody | CreateCityBody | CreateMethodBody;

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const repo = new ShippingRepository(supabase);

    const { data: zones, error: zonesErr } = await repo.findAllZones();
    if (zonesErr) throw zonesErr;

    const result = await Promise.all(
      (zones ?? []).map(async (zone) => {
        const { data: cities } = await repo.findCitiesByZone(zone.id);
        const citiesWithMethods = await Promise.all(
          (cities ?? []).map(async (city) => {
            const { data: methods } = await repo.findMethodsByCity(city.id);
            return { ...city, methods: methods ?? [] };
          })
        );
        return { ...zone, cities: citiesWithMethods };
      })
    );

    return successResponse(result);
  } catch (err: unknown) {
    console.error('GET /api/shipping error:', err);
    return internalServerError(toErrorMessage(err));
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBody;
    const admin = createAdminClient();
    const repo = new ShippingRepository(admin);

    if (body.type === 'zone') {
      if (!body.name) return badRequest('Zone name is required');
      const { data: zone, error: zoneErr } = await repo.createZone({
        name: body.name,
        description: body.description ?? '',
      });
      if (zoneErr) throw zoneErr;

      // Assign existing cities to this zone if city_ids provided
      if (Array.isArray(body.city_ids) && body.city_ids.length > 0 && zone) {
        for (const cityId of body.city_ids) {
          await repo.updateCity(cityId, { zone_id: zone.id });
        }
      }

      const { data: cities } = zone ? await repo.findCitiesByZone(zone.id) : { data: [] };
      const citiesWithMethods = await Promise.all(
        (cities ?? []).map(async (city) => {
          const { data: methods } = await repo.findMethodsByCity(city.id);
          return { ...city, methods: methods ?? [] };
        })
      );
      return successResponse({ ...zone, cities: citiesWithMethods }, 201);
    }

    if (body.type === 'city') {
      if (!body.name || !body.zone_id) return badRequest('City name and zone_id are required');
      const { data: city, error: cityErr } = await repo.createCity({
        name: body.name,
        name_ar: body.name_ar ?? '',
        zone_id: body.zone_id,
        latitude: body.latitude ?? 0,
        longitude: body.longitude ?? 0,
      });
      if (cityErr) throw cityErr;
      return successResponse({ ...city, methods: [] }, 201);
    }

    if (body.type === 'method') {
      if (!body.city_id || !body.zone_id || !body.name) return badRequest('city_id, zone_id, and name are required');
      const { data: method, error: methodErr } = await repo.createMethod({
        city_id: body.city_id,
        zone_id: body.zone_id,
        name: body.name,
        slug: body.slug ?? 'standard',
        price: body.price ?? 0,
        estimated_days: body.estimated_days ?? 2,
        estimated_hours: body.estimated_hours ?? null,
        description: body.description ?? '',
      });
      if (methodErr) throw methodErr;
      return successResponse(method, 201);
    }

    return badRequest('Invalid type — expected "zone", "city", or "method"');
  } catch (err: unknown) {
    console.error('POST /api/shipping error:', err);
    return internalServerError(toErrorMessage(err));
  }
}
