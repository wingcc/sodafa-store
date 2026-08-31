ALTER TABLE products
  ADD COLUMN IF NOT EXISTS more_info JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN products.more_info IS 'Structured product detail metadata: ingredients, benefits, how_to_use, shopping_info';
