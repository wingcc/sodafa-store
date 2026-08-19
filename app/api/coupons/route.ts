/**
 * Coupons API
 * GET  /api/coupons        — List coupons (admin)
 * POST /api/coupons        — Create coupon (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { CouponRepository } from '@/lib/db';
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

    if (!body.code || !body.discountValue || !body.endDate) {
      return badRequest('Code, discountValue, and endDate are required');
    }

    const { data, error } = await repo.create({
      code: body.code.toUpperCase(),
      description: body.description ?? '',
      discount_type: body.discountType ?? 'percentage',
      discount_value: body.discountValue,
      minimum_order: body.minimumOrder ?? 0,
      maximum_discount: body.maximumDiscount ?? null,
      applicable_to: body.applicableTo ?? 'all',
      applicable_ids: body.applicableIds ?? [],
      start_date: body.startDate ?? new Date().toISOString(),
      end_date: body.endDate,
      usage_limit: body.usageLimit ?? 0,
      customer_usage_limit: body.customerUsageLimit ?? 1,
      status: body.status ?? 'active',
    });

    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    console.error('POST /api/coupons error:', err);
    return internalServerError(err.message);
  }
}