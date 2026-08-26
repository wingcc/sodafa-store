/**
 * Coupon Validation API
 * POST /api/coupons/validate — Validate a coupon code against cart subtotal/items (server-side, admin client).
 *
 * Coupons have NO public SELECT policy (only admin FOR ALL), so the anon
 * client cannot read them. This endpoint uses the admin client to perform
 * full server-side validation that the frontend must never trust.
 */

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateCoupon } from '@/lib/server/coupons';
import { successResponse, badRequest, internalServerError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const ValidateSchema = z.object({
      code: z.string().min(1, 'Coupon code is required'),
      subtotal: z.number().nonnegative('Subtotal must be a number'),
      productIds: z.array(z.string()).optional(),
      customerPhone: z.string().optional(),
      customerEmail: z.string().optional(),
    });

    const parsed = ValidateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Validation failed', { issues: parsed.error.issues });
    }

    const admin = createAdminClient();
    const result = await validateCoupon(admin, parsed.data.code, {
      subtotal: parsed.data.subtotal,
      productIds: parsed.data.productIds,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail,
    });

    return successResponse(result);
  } catch (err: any) {
    console.error('POST /api/coupons/validate error:', err);
    return internalServerError(err?.message ?? 'Failed to validate coupon');
  }
}
