/**
 * Shipping API
 * GET  /api/shipping        — List zones and methods
 * POST /api/shipping        — Create zone/method (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ShippingRepository } from '@/lib/db';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

interface ShippingMethodInput {
  id?: string;
  name: string;
  price?: number;
  estimatedDays?: string;
  freeShippingThreshold?: number | null;
}

interface CreateZoneBody {
  type: 'zone';
  name: string;
  cities?: string[];
  methods?: ShippingMethodInput[];
}

interface CreateMethodBody {
  type: 'method';
  zoneId: string;
  name: string;
  price?: number;
  estimatedDays?: string;
  freeShippingThreshold?: number | null;
}

type CreateBody = CreateZoneBody | CreateMethodBody;

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const repo = new ShippingRepository(supabase);

    const { data: zones, error } = await repo.findAllZones();
    if (error) throw error;

    // Fetch methods for each zone
    const zonesWithMethods = await Promise.all(
      (zones ?? []).map(async (zone) => {
        const { data: methods } = await repo.findMethodsByZone(zone.id);
        return { ...zone, methods: methods ?? [] };
      })
    );

    return successResponse(zonesWithMethods);
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
      if (!body.name) {
        return badRequest('Zone name is required');
      }

      const { data: zone, error: zoneErr } = await repo.createZone({
        name: body.name,
        cities: body.cities ?? [],
      });
      if (zoneErr) throw zoneErr;

      // Create associated shipping methods
      const createdMethods = [];
      if (Array.isArray(body.methods) && body.methods.length > 0) {
        for (const method of body.methods) {
          const { data: m, error: methodErr } = await repo.createMethod({
            zone_id: zone.id,
            name: method.name,
            price: method.price ?? 0,
            estimated_days: method.estimatedDays ?? '3-5 days',
            free_shipping_threshold: method.freeShippingThreshold ?? null,
          });
          if (methodErr) throw methodErr;
          if (m) createdMethods.push(m);
        }
      }

      return successResponse({ ...zone, methods: createdMethods }, 201);
    }

    if (body.type === 'method') {
      const { data, error } = await repo.createMethod({
        zone_id: body.zoneId,
        name: body.name,
        price: body.price ?? 0,
        estimated_days: body.estimatedDays ?? '3-5 days',
        free_shipping_threshold: body.freeShippingThreshold ?? null,
      });
      if (error) throw error;
      return successResponse(data, 201);
    }

    return badRequest('Invalid type — expected "zone" or "method"');
  } catch (err: unknown) {
    console.error('POST /api/shipping error:', err);
    return internalServerError(toErrorMessage(err));
  }
}
