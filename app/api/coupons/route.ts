/**
 * Coupons API
 * GET  /api/coupons        — List coupons (admin)
 * POST /api/coupons        — Create coupon (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { CouponRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new CouponRepository(admin);

    const { data, error } = await repo.findAll({
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      offset: Number(searchParams.get('offset')) || undefined,
    });

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/coupons error:', err);
    return internalServerError(err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new CouponRepository(admin);

    const code = body.code;
    const discountValue = body.discount_value ?? body.discountValue;
    const endDate = body.end_date ?? body.endDate;

    if (!code || discountValue == null || !endDate) {
      return badRequest('Code, discount_value, and end_date are required');
    }

    const { data, error } = await repo.create({
      code: String(code).toUpperCase(),
      description: body.description ?? '',
      discount_type: body.discount_type ?? body.discountType ?? 'percentage',
      discount_value: discountValue,
      minimum_order: body.minimum_order ?? body.minimumOrder ?? 0,
      maximum_discount: body.maximum_discount ?? body.maximumDiscount ?? null,
      applicable_to: body.applicable_to ?? body.applicableTo ?? 'all',
      applicable_ids: body.applicable_ids ?? body.applicableIds ?? [],
      start_date: body.start_date ?? body.startDate ?? new Date().toISOString(),
      end_date: endDate,
      usage_limit: body.usage_limit ?? body.usageLimit ?? 0,
      customer_usage_limit: body.customer_usage_limit ?? body.customerUsageLimit ?? 1,
      status: body.status ?? 'active',
    });

    if (error) throw error;

    // Send notification
    try {
      await notificationService.create({
        type: 'promotion',
        title: 'New coupon created',
        message: `Coupon "${String(code).toUpperCase()}" has been created with ${discountValue}${body.discount_type === 'percentage' ? '%' : ' MAD'} discount.`,
        priority: 'low',
        metadata: { couponId: data?.id, code: String(code).toUpperCase() },
      });
    } catch (e) {
      console.error('Failed to send coupon notification:', e);
    }

    return successResponse(data, 201);
  } catch (err: any) {
    console.error('POST /api/coupons error:', err);
    return internalServerError(err.message);
  }
}