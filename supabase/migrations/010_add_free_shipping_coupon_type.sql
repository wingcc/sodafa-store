-- Migration: Add free_shipping to coupon_discount_type enum
-- This allows coupons to offer free shipping as a discount type

-- Add the new enum value (Postgres requires this syntax for adding to existing enums)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'free_shipping' AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'coupon_discount_type'
    )
  ) THEN
    ALTER TYPE coupon_discount_type ADD VALUE 'free_shipping';
  END IF;
END
$$;
