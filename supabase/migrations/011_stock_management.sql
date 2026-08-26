-- ============================================================
-- SODFA STORE - Atomic stock management RPCs
-- Migration: 011_stock_management
-- Description: Atomic decrement_stock that checks + decrements
--              in one statement, preventing race conditions.
-- ============================================================

-- update_stock: atomically adjust product stock (restock only)
-- quantity > 0 = restock, quantity < 0 = decrement
CREATE OR REPLACE FUNCTION update_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE products
  SET stock = GREATEST(stock + p_quantity, 0)
  WHERE id = p_product_id
  RETURNING stock INTO new_stock;

  RETURN COALESCE(new_stock, -1);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE;

COMMENT ON FUNCTION update_stock IS 'Atomically adjusts product stock by quantity. Returns new stock level, or -1 if product not found.';

-- decrement_stock: atomically check + decrement in ONE statement
-- Returns the new stock level on success, or -1 on failure.
-- Fails if: product not found, track_inventory is false,
--           or insufficient stock.
-- Callers check: result >= 0 = success, result < 0 = failure.
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_qty INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE products
  SET stock = stock - p_qty
  WHERE id = p_product_id
    AND track_inventory = TRUE
    AND stock >= p_qty
  RETURNING stock INTO new_stock;

  IF new_stock IS NULL THEN
    RETURN -1;
  END IF;

  -- Also bump total_sold atomically
  UPDATE products
  SET total_sold = total_sold + p_qty
  WHERE id = p_product_id;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE;

COMMENT ON FUNCTION decrement_stock IS 'Atomically checks stock availability and decrements. Returns new stock on success, -1 if insufficient stock or product not found. Prevents race conditions by doing check+decrement in one UPDATE.';
