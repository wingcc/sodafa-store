/**
 * Single Coupon API
 * PUT    /api/coupons/[id]  — Update coupon (admin)
 * DELETE /api/coupons/[id]  — Delete coupon (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { CouponRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
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

    // Send notification
    try {
      await notificationService.create({
        type: 'promotion',
        title: 'Coupon updated',
        message: `Coupon has been updated.`,
        priority: 'low',
        metadata: { couponId: id, code: data?.code },
      });
    } catch (e) {
      console.error('Failed to send coupon update notification:', e);
    }

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

    // Send notification
    try {
      await notificationService.create({
        type: 'promotion',
        title: 'Coupon deleted',
        message: `A coupon has been deleted.`,
        priority: 'low',
        metadata: { couponId: id },
      });
    } catch (e) {
      console.error('Failed to send coupon delete notification:', e);
    }

    return successResponse({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/coupons/[id] error:', err);
    return internalServerError(err.message);
  }
}