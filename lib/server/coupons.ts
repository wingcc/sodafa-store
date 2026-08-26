/** Server-side coupon helpers (admin client — bypasses RLS). */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CouponRow } from '@/lib/supabase/types';
import { CouponRepository } from '@/lib/db';

export interface ValidateCouponResult {
  valid: boolean;
  coupon?: CouponRow;
  discount: number;
  reason?: string;
}

export interface ValidateCouponInput {
  subtotal: number;
  productIds?: string[];
  customerPhone?: string;
  customerEmail?: string;
}

export async function validateCoupon(
  admin: SupabaseClient,
  code: string | null | undefined,
  input: ValidateCouponInput
): Promise<ValidateCouponResult> {
  if (!code) return { valid: false, discount: 0, reason: 'No coupon code provided' };
  const { data: coupon, error } = await new CouponRepository(admin).findByCode(code);
  if (error || !coupon) return { valid: false, discount: 0, reason: 'Invalid coupon code' };
  if (coupon.status !== 'active') return { valid: false, discount: 0, reason: `Coupon is ${coupon.status}` };
  const now = new Date();
  if (new Date(coupon.start_date) > now) return { valid: false, discount: 0, reason: 'Coupon has not started yet' };
  if (new Date(coupon.end_date) < now) return { valid: false, discount: 0, reason: 'Coupon has expired' };
  if (coupon.usage_limit > 0 && (coupon.used_count ?? 0) >= coupon.usage_limit) {
    return { valid: false, discount: 0, reason: 'Coupon usage limit reached' };
  }
  if (input.subtotal < (coupon.minimum_order ?? 0)) {
    return { valid: false, discount: 0, reason: `Minimum order ${coupon.minimum_order ?? 0} MAD not reached` };
  }

  // ── Customer-specific coupon check ──────────────────────────────────
  if (coupon.applicable_to === 'customers') {
    const allowedIds = (coupon.applicable_ids ?? []).map((s: string) => s.trim()).filter(Boolean);
    if (allowedIds.length > 0) {
      let customerId: string | null = null;

      // Look up customer by phone
      if (input.customerPhone) {
        const { data: phoneCustomer } = await admin
          .from('customers')
          .select('id')
          .eq('phone', input.customerPhone)
          .single();
        if (phoneCustomer) customerId = phoneCustomer.id;
      }

      // Fallback: look up customer by email
      if (!customerId && input.customerEmail) {
        const { data: emailCustomer } = await admin
          .from('customers')
          .select('id')
          .eq('email', input.customerEmail)
          .single();
        if (emailCustomer) customerId = emailCustomer.id;
      }

      if (!customerId || !allowedIds.includes(customerId)) {
        return { valid: false, discount: 0, reason: 'This coupon is not available for your account' };
      }
    }
  }

  // Scope check for product/category coupons.
  if (input.productIds && (coupon.applicable_to === 'products' || coupon.applicable_to === 'categories')) {
    const ids = (coupon.applicable_ids ?? []).map((s: string) => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      const cartIds = (input.productIds ?? []).map((s: string) => s.trim());
      if (coupon.applicable_to === 'products' && !cartIds.some((id) => ids.includes(id))) {
        return { valid: false, discount: 0, reason: 'Coupon does not apply to cart items' };
      }
    }
  }

  // Compute discount (frontend-discount is NEVER trusted).
  let discount =
    coupon.discount_type === 'percentage'
      ? (input.subtotal * coupon.discount_value) / 100
      : coupon.discount_value;
  discount = Math.min(discount, input.subtotal);
  if (coupon.maximum_discount != null && coupon.maximum_discount > 0) {
    discount = Math.min(discount, coupon.maximum_discount);
  }
  return { valid: true, coupon, discount: Math.round((discount + Number.EPSILON) * 100) / 100 };
}

/** Convenience: validate + return discount, rethrow-safe for routes. */
export const computeCouponDiscount = validateCoupon;
