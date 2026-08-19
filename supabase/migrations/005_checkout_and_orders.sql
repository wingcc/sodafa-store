-- ============================================================
-- SODFA STORE - Checkout, Orders & Delivery hardening
-- Migration: 005_checkout_and_orders
-- Description: Adds delivery method + coupon code to orders,
--              and the missing increment_coupon_usage RPC.
--              Safe & additive: only ADDs columns/functions.
-- ============================================================

-- ============================================================
-- Order: record the chosen delivery method name + applied coupon code
-- ============================================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN orders.delivery_method IS 'Standard / Express (or other) chosen by the customer at checkout';
COMMENT ON COLUMN orders.coupon_code   IS 'Coupon code applied to the order (nullable)';

-- Keep coupon lookups fast (already indexed on code, but reinforce uniqueness semantics)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_coupon_code_search ON orders(coupon_code) WHERE coupon_code IS NOT NULL;

-- ============================================================
-- Coupon usage RPC
-- Referenced by lib/db/repositories/coupon.ts -> CouponRepository.incrementUsage
-- Must exist or the call always errors.
--
-- Semantics:
--   * usage_limit = 0  -> unlimited usage (no cap enforced)
--   * usage_limit > 0  -> may only be incremented while used_count < usage_limit
--   * Increments atomically; returns the new used_count (NULL if not incremented / guard not met).
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id
    AND (usage_limit = 0 OR used_count < usage_limit)
  RETURNING used_count INTO new_count;

  RETURN COALESCE(new_count, -1);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE; -- because it mutates used_count

COMMENT ON FUNCTION increment_coupon_usage IS 'Atomically increments coupon.used_count, respecting usage_limit (0 = unlimited). Returns new count or -1 if the guard blocked the increment.';
