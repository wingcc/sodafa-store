-- ============================================================
-- SODFA STORE — Shopping Schema Migration
-- Cleanup: remove old shipping_zones/shipping_methods
-- Install: new delivery_zones/delivery_cities/delivery_methods
-- ============================================================

-- ============================================================
-- SECTION 1: CLEANUP OLD SHOPPING
-- Only runs if old tables exist. Safe on fresh databases.
-- ============================================================

-- Drop old tables (cascades policies, indexes, FKs automatically)
-- shipping_methods FK → shipping_zones, so drop methods first
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipping_methods') THEN
    DROP TABLE shipping_methods;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipping_zones') THEN
    DROP TABLE shipping_zones;
  END IF;
END $$;

-- ============================================================
-- SECTION 2: INSTALL NEW SHOPPING
-- ============================================================

-- 2a. Create delivery_zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2b. Create delivery_cities table
CREATE TABLE IF NOT EXISTS delivery_cities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  name_ar     TEXT DEFAULT '',
  zone_id     UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  latitude    REAL NOT NULL DEFAULT 0,
  longitude   REAL NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2c. Create delivery_methods table
CREATE TABLE IF NOT EXISTS delivery_methods (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id          UUID NOT NULL REFERENCES delivery_cities(id) ON DELETE CASCADE,
  zone_id          UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL DEFAULT 'standard',
  price            REAL NOT NULL DEFAULT 0,
  estimated_days   INTEGER NOT NULL DEFAULT 2,
  estimated_hours  INTEGER,
  description      TEXT DEFAULT '',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2d. Create indexes
CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON delivery_cities(zone_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON delivery_cities(name);
CREATE INDEX IF NOT EXISTS idx_methods_city_id ON delivery_methods(city_id);
CREATE INDEX IF NOT EXISTS idx_methods_zone_id ON delivery_methods(zone_id);
CREATE INDEX IF NOT EXISTS idx_methods_slug ON delivery_methods(slug);

-- 2e. Create triggers (reuse update_updated_at_column)
CREATE TRIGGER trigger_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cities_updated_at
  BEFORE UPDATE ON delivery_cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_methods_updated_at
  BEFORE UPDATE ON delivery_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2f. Enable RLS on delivery tables
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_methods ENABLE ROW LEVEL SECURITY;

-- 2g. Create RLS policies

-- Allow all operations for authenticated users (admin dashboard)
CREATE POLICY "Allow all for authenticated users" ON delivery_zones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON delivery_cities
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON delivery_methods
  FOR ALL USING (true) WITH CHECK (true);

-- Allow read-only for anon (public checkout page reads delivery options)
CREATE POLICY "Allow read for anon" ON delivery_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read for anon" ON delivery_cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read for anon" ON delivery_methods
  FOR SELECT USING (is_active = true);

-- ============================================================
-- SECTION 3: SEED DATA
-- ============================================================

-- 3a. Insert delivery zones
INSERT INTO delivery_zones (id, name, description, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Zone Grand Casablanca', 'Greater Casablanca metropolitan area', true),
  ('a1000000-0000-0000-0000-000000000002', 'Zone Rabat-Salé', 'Rabat and Salé metropolitan area', true),
  ('a1000000-0000-0000-0000-000000000003', 'Zone Marrakech-Safi', 'Marrakech and Safi region', true),
  ('a1000000-0000-0000-0000-000000000004', 'Zone Fès-Meknès', 'Fès and Meknès region', true),
  ('a1000000-0000-0000-0000-000000000005', 'Zone Tanger-Tétouan', 'Tanger and Tétouan region', true),
  ('a1000000-0000-0000-0000-000000000006', 'Zone Souss-Massa', 'Agadir and Tiznit region', true),
  ('a1000000-0000-0000-0000-000000000007', 'Zone Oriental', 'Oujda and Berkane region', true),
  ('a1000000-0000-0000-0000-000000000008', 'Zone Drâa-Tafilalet', 'Errachidia and Ouarzazate region', true)
ON CONFLICT (id) DO NOTHING;

-- 3b. Insert delivery cities
INSERT INTO delivery_cities (id, name, name_ar, zone_id, latitude, longitude, is_active) VALUES
  -- Grand Casablanca
  ('b1000000-0000-0000-0000-000000000001', 'Casablanca',  'الدار البيضاء', 'a1000000-0000-0000-0000-000000000001', 33.5731, -7.5898, true),
  ('b1000000-0000-0000-0000-000000000002', 'Mohammedia',  'المحمدية',      'a1000000-0000-0000-0000-000000000001', 33.6866, -7.3830, true),
  ('b1000000-0000-0000-0000-000000000003', 'Berrechid',    'برشيد',          'a1000000-0000-0000-0000-000000000001', 33.2654, -7.5866, true),
  ('b1000000-0000-0000-0000-000000000004', 'El Jadida',    'الجديدة',       'a1000000-0000-0000-0000-000000000001', 33.2549, -8.5009, true),
  -- Rabat-Salé
  ('b1000000-0000-0000-0000-000000000005', 'Rabat',        'الرباط',        'a1000000-0000-0000-0000-000000000002', 34.0209, -6.8416, true),
  ('b1000000-0000-0000-0000-000000000006', 'Khemisset',    'الخميسات',      'a1000000-0000-0000-0000-000000000002', 33.8241, -6.0664, true),
  ('b1000000-0000-0000-0000-000000000007', 'Kénitra',      'القنيطرة',     'a1000000-0000-0000-0000-000000000002', 34.2610, -6.5802, true),
  -- Marrakech-Safi
  ('b1000000-0000-0000-0000-000000000008', 'Marrakech',    'مراكش',        'a1000000-0000-0000-0000-000000000003', 31.6295, -7.9811, true),
  ('b1000000-0000-0000-0000-000000000009', 'Safi',         'آسفي',         'a1000000-0000-0000-0000-000000000003', 32.2994, -9.2372, true),
  ('b1000000-0000-0000-0000-000000000010', 'Essaouira',    'الصويرة',      'a1000000-0000-0000-0000-000000000003', 31.5085, -9.7595, true),
  -- Fès-Meknès
  ('b1000000-0000-0000-0000-000000000011', 'Fès',          'فاس',          'a1000000-0000-0000-0000-000000000004', 34.0331, -5.0003, true),
  ('b1000000-0000-0000-0000-000000000012', 'Meknès',       'مكناس',        'a1000000-0000-0000-0000-000000000004', 33.8935, -5.5473, true),
  ('b1000000-0000-0000-0000-000000000013', 'Ifrane',       'إفران',        'a1000000-0000-0000-0000-000000000004', 33.5228, -5.1107, true),
  ('b1000000-0000-0000-0000-000000000014', 'Azrou',        'عزرو',         'a1000000-0000-0000-0000-000000000004', 33.4344, -5.2217, true),
  -- Tanger-Tétouan
  ('b1000000-0000-0000-0000-000000000015', 'Tanger',       'طنجة',         'a1000000-0000-0000-0000-000000000005', 35.7595, -5.8340, true),
  ('b1000000-0000-0000-0000-000000000016', 'Tétouan',      'تطوان',        'a1000000-0000-0000-0000-000000000005', 35.5889, -5.3626, true),
  ('b1000000-0000-0000-0000-000000000017', 'Chefchaouen',  'شفشاون',       'a1000000-0000-0000-0000-000000000005', 35.1714, -5.2697, true),
  -- Souss-Massa
  ('b1000000-0000-0000-0000-000000000018', 'Agadir',       'أكادير',       'a1000000-0000-0000-0000-000000000006', 30.4278, -9.5981, true),
  ('b1000000-0000-0000-0000-000000000019', 'Tiznit',       'تيزنيت',       'a1000000-0000-0000-0000-000000000006', 29.6974, -9.8022, true),
  -- Oriental
  ('b1000000-0000-0000-0000-000000000020', 'Oujda',        'وجدة',         'a1000000-0000-0000-0000-000000000007', 34.6867, -1.9114, true),
  ('b1000000-0000-0000-0000-000000000021', 'Berkane',      'بركان',        'a1000000-0000-0000-0000-000000000007', 35.0543, -2.9214, true),
  ('b1000000-0000-0000-0000-000000000022', 'Nador',        'الناظور',      'a1000000-0000-0000-0000-000000000007', 35.1688, -2.9286, true),
  -- Drâa-Tafilalet
  ('b1000000-0000-0000-0000-000000000023', 'Errachidia',   'الراشيدية',    'a1000000-0000-0000-0000-000000000008', 31.9314, -4.4269, true),
  ('b1000000-0000-0000-0000-000000000024', 'Ouarzazate',   'ورزازات',      'a1000000-0000-0000-0000-000000000008', 30.9197, -6.8933, true),
  ('b1000000-0000-0000-0000-000000000025', 'Midelt',       'ميدلت',        'a1000000-0000-0000-0000-000000000008', 32.6853, -4.7381, true)
ON CONFLICT (id) DO NOTHING;

-- 3c. Insert delivery methods
INSERT INTO delivery_methods (city_id, zone_id, name, slug, price, estimated_days, estimated_hours, description, is_active) VALUES
  -- Casablanca — fully configured
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Standard Delivery', 'standard', 30, 2, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Express Delivery',  'express',  50, 1, 24,   'Fast express delivery', true),
  -- Mohammedia — standard only
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Standard Delivery', 'standard', 35, 2, NULL, 'Standard home delivery', true),
  -- Rabat — fully configured
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Standard Delivery', 'standard', 30, 2, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Express Delivery',  'express',  50, 1, 24,   'Fast express delivery', true),
  -- Khemisset — standard (inactive)
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Standard Delivery', 'standard', 35, 3, NULL, 'Standard delivery', false),
  -- Marrakech — fully configured
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Standard Delivery', 'standard', 35, 3, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Express Delivery',  'express',  60, 1, 24,   'Fast express delivery', true),
  -- Fès — standard only
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'Standard Delivery', 'standard', 35, 3, NULL, 'Standard home delivery', true),
  -- Meknès — standard only
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'Standard Delivery', 'standard', 40, 3, NULL, 'Standard delivery', true),
  -- Tanger — fully configured
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Standard Delivery', 'standard', 40, 3, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Express Delivery',  'express',  65, 1, 24,   'Fast express delivery', true),
  -- Agadir — standard only
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000006', 'Standard Delivery', 'standard', 40, 3, NULL, 'Standard home delivery', true),
  -- Oujda — standard only
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000007', 'Standard Delivery', 'standard', 45, 4, NULL, 'Standard delivery', true);
