/**
 * Single Shipping Zone API
 * GET    /api/shipping/[id]  — Get zone with its methods (public read)
 * PUT    /api/shipping/[id]  — Update zone + sync methods (admin)
 * DELETE /api/shipping/[id]  — Delete zone (admin, methods cascade via FK)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ShippingRepository } from '@/lib/db';
import { successResponse, internalServerError, notFound } from '@/lib/api';
import type { Json, ShippingZoneUpdate } from '@/lib/supabase/types';

interface ShippingMethodBody {
  id?: string;
  name: string;
  price?: number;
  estimatedDays?: string;
  estimated_days?: string;
  freeShippingThreshold?: number | null;
  free_shipping_threshold?: number | null;
}

interface ShippingZoneBody {
  name?: string;
  cities?: Json;
  methods?: ShippingMethodBody[];
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
    if (!zone) return notFound('Shipping zone not found');

    const { data: methods } = await repo.findMethodsByZone(zone.id);

    return successResponse({
      ...zone,
      methods: methods ?? [],
    });
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
    const body = (await request.json()) as ShippingZoneBody;
    const admin = createAdminClient();
    const repo = new ShippingRepository(admin);

    // Verify the zone exists before attempting to update
    const { data: existing, error: findErr } = await repo.findZoneById(id);
    if (findErr) throw findErr;
    if (!existing) return notFound('Shipping zone not found');

    // Update core zone fields
    const zoneUpdates: ShippingZoneUpdate = {};
    if (body.name !== undefined) zoneUpdates.name = body.name;
    if (body.cities !== undefined) zoneUpdates.cities = body.cities;

    const { data: updatedZone, error: updErr } = await repo.updateZone(id, zoneUpdates);
    if (updErr) throw updErr;

    // Sync shipping methods (update existing, add new, remove deleted)
    if (Array.isArray(body.methods)) {
      const { data: currentMethods } = await repo.findMethodsByZone(id);
      const current = (currentMethods ?? []) as Array<{ id: string }>;

      // Track which incoming methods have IDs so we can delete the rest
      const incomingIds = new Set<string>();

      for (const method of body.methods) {
        const methodPayload = {
          name: method.name,
          price: Number(method.price ?? 0),
          estimated_days: method.estimatedDays ?? method.estimated_days ?? '3-5 days',
          free_shipping_threshold:
            method.freeShippingThreshold ?? method.free_shipping_threshold ?? null,
        };

        if (method.id) {
          incomingIds.add(method.id);
          const { error: mErr } = await repo.updateMethod(method.id, methodPayload);
          if (mErr) throw mErr;
        } else {
          const { error: mErr } = await repo.createMethod({
            zone_id: id,
            ...methodPayload,
          });
          if (mErr) throw mErr;
        }
      }

      // Remove methods that were not in the incoming list
      for (const m of current) {
        if (!incomingIds.has(m.id)) {
          const { error: delErr } = await repo.deleteMethod(m.id);
          if (delErr) throw delErr;
        }
      }
    }

    // Re-fetch the latest set of methods for the response
    const { data: methods } = await repo.findMethodsByZone(id);

    return successResponse({
      ...updatedZone,
      methods: methods ?? [],
    });
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
