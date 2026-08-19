-- ============================================================
-- COUPONS TABLE MIGRATION
-- ============================================================

-- Create the coupons table if it doesn't exist
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  discount_type coupon_discount_type NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order DECIMAL(12,2) DEFAULT 0,
  maximum_discount DECIMAL(12,2) DEFAULT NULL,
  applicable_to coupon_applicable_to DEFAULT 'all',
  applicable_ids UUID[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  customer_usage_limit INTEGER DEFAULT 1,
  status coupon_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons USING btree (code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons USING btree (status);

-- Create index on dates for date range queries
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons USING btree (start_date, end_date);

-- Create RPC function for incrementing usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE coupons 
  SET used_count = used_count + 1, updated_at = NOW()
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON coupons
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON coupons
  FOR INSERT TO service_role, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON coupons
  FOR UPDATE TO service_role, authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON coupons
  FOR DELETE TO service_role, authenticated
  USING (true);