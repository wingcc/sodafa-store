-- ============================================================
-- SODFA STORE - Fix coupon code unique index
-- Migration: 012_fix_coupon_code_index
-- Description: The partial unique index on orders.coupon_code
--   prevented the same coupon from being used on multiple orders.
--   Coupons should be reusable (up to usage_limit).
--   Drop the unique index, replace with a regular index for search.
-- ============================================================

-- Drop the unique constraint (this is what causes the error)
DROP INDEX IF EXISTS idx_orders_coupon_code_search;

-- Replace with a non-unique index for fast coupon lookups
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code) WHERE coupon_code IS NOT NULL;
