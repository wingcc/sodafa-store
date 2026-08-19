/**
 * Single Coupon API
 * PUT    /api/coupons/[id]  — Update coupon (admin)
 * DELETE /api/coupons/[id]  — Delete coupon (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { CouponRepository } from '@/lib/db';
import { successResponse, internalServerError } from '@/lib/api';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new CouponRepository(admin);

    const { data, error } = await repo.update(id, body);
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/coupons/[id] error:', err);
    return internalServerError(err.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const repo = new CouponRepository(admin);

    const { error } = await repo.delete(id);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/coupons/[id] error:', err);
    return internalServerError(err.message);
  }
}