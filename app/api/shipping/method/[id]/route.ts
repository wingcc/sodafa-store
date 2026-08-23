/**
 * Single Delivery Method API
 * PUT    /api/shipping/method/[id]  — Update a delivery method
 * DELETE /api/shipping/method/[id]  — Delete a delivery method
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { ShippingRepository } from '@/lib/db';
import { successResponse, internalServerError, notFound } from '@/lib/api';

interface MethodUpdateBody {
  name?: string;
  slug?: string;
  price?: number;
  estimated_days?: number;
  estimated_hours?: number | null;
  description?: string;
  is_active?: boolean;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as MethodUpdateBody;
    const admin = createAdminClient();
    const repo = new ShippingRepository(admin);

    const { data: existing, error: findErr } = await repo.findMethodById(id);
    if (findErr) throw findErr;
    if (!existing) return notFound('Delivery method not found');

    const { data: updated, error: updErr } = await repo.updateMethod(id, body);
    if (updErr) throw updErr;

    return successResponse(updated);
  } catch (err: unknown) {
    console.error('PUT /api/shipping/method/[id] error:', err);
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

    const { data: existing, error: findErr } = await repo.findMethodById(id);
    if (findErr) throw findErr;
    if (!existing) return notFound('Delivery method not found');

    const { error: delErr } = await repo.deleteMethod(id);
    if (delErr) throw delErr;

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    console.error('DELETE /api/shipping/method/[id] error:', err);
    return internalServerError(toErrorMessage(err));
  }
}
