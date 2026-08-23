-- 010: Add is_active to shipping_methods (per-method enable/disable)
ALTER TABLE shipping_methods
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
