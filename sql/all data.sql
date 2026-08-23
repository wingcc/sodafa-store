-- ============================================================
-- SODFA STORE — Production Database Schema
-- Merged from: 001-010 migrations + schema.sql (delivery)
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. ENUMS
-- ============================================================

CREATE TYPE product_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'credit_card', 'bank_transfer', 'mobile_payment');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE coupon_applicable_to AS ENUM ('all', 'products', 'categories', 'customers');
CREATE TYPE coupon_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE notification_type AS ENUM (
  'order', 'customer', 'stock', 'review', 'payment', 'system',
  'product', 'shipping', 'promotion', 'social', 'inventory', 'security',
  'account', 'message', 'achievement', 'reminder', 'subscription',
  'support', 'analytics', 'team', 'event', 'custom'
);
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE admin_role AS ENUM ('super_admin', 'manager', 'editor', 'support');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'blocked');
CREATE TYPE category_status AS ENUM ('active', 'inactive');

-- ============================================================
-- 3. TABLES
-- ============================================================

-- -------------------- CATEGORIES --------------------
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_count INTEGER DEFAULT 0,
  status category_status DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- PRODUCTS --------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  short_description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  sku VARCHAR(100) NOT NULL UNIQUE,
  brand VARCHAR(100) DEFAULT 'SODFA',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory VARCHAR(100) DEFAULT NULL,
  tags TEXT[] DEFAULT '{}',
  regular_price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2) DEFAULT NULL,
  cost_price DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MAD',
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  track_inventory BOOLEAN DEFAULT TRUE,
  ADS BOOLEAN DEFAULT FALSE,
  ShowInStor BOOLEAN DEFAULT FALSE,
  images JSONB DEFAULT '[]'::jsonb,
  status product_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_slug VARCHAR(300) DEFAULT NULL,
  seo_keywords TEXT[] DEFAULT '{}',
  total_sold INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- PRODUCT VARIANTS --------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  stock INTEGER DEFAULT 0,
  image TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- CUSTOMERS --------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  avatar TEXT DEFAULT NULL,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(14,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MAD',
  last_order_date TIMESTAMPTZ DEFAULT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status customer_status DEFAULT 'active',
  favorite_categories TEXT[] DEFAULT '{}'
);

-- -------------------- CUSTOMER ADDRESSES --------------------
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100) DEFAULT 'Home',
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- ORDERS --------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) DEFAULT '',
  customer_email VARCHAR(255) DEFAULT '',
  customer_phone VARCHAR(50) DEFAULT '',
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MAD',
  payment_method payment_method DEFAULT 'cash_on_delivery',
  payment_status payment_status DEFAULT 'pending',
  order_status order_status DEFAULT 'pending',
  shipping_address JSONB DEFAULT '{}'::jsonb,
  billing_address JSONB DEFAULT '{}'::jsonb,
  tracking_number VARCHAR(100) DEFAULT NULL,
  shipping_provider VARCHAR(100) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  delivery_method VARCHAR(100) DEFAULT NULL,
  coupon_code VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN orders.delivery_method IS 'Standard / Express (or other) chosen by the customer at checkout';
COMMENT ON COLUMN orders.coupon_code IS 'Coupon code applied to the order (nullable)';

-- -------------------- ORDER ITEMS --------------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT DEFAULT '',
  variant VARCHAR(100) DEFAULT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL
);

-- -------------------- ORDER TIMELINE --------------------
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  note TEXT DEFAULT NULL
);

-- -------------------- REVIEWS --------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) DEFAULT 'Anonymous',
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  status review_status DEFAULT 'pending',
  admin_reply TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- COUPONS --------------------
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  discount_type coupon_discount_type NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(12,2) NOT NULL,
  minimum_order DECIMAL(12,2) DEFAULT 0,
  maximum_discount DECIMAL(12,2) DEFAULT NULL,
  applicable_to coupon_applicable_to DEFAULT 'all',
  applicable_ids TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  customer_usage_limit INTEGER DEFAULT 1,
  status coupon_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- NOTIFICATIONS --------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type notification_type DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500) DEFAULT NULL,
  priority notification_priority NOT NULL DEFAULT 'medium',
  starred BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- ADMIN USERS --------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role admin_role DEFAULT 'editor',
  avatar TEXT DEFAULT NULL,
  last_login TIMESTAMPTZ DEFAULT NULL,
  status customer_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- SHIPPING ZONES --------------------
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- SHIPPING METHODS --------------------
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) DEFAULT 0,
  estimated_days VARCHAR(50) DEFAULT '3-5 days',
  free_shipping_threshold DECIMAL(12,2) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- STORE SETTINGS --------------------
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- HOMEPAGE SECTIONS --------------------
CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  "order" INTEGER DEFAULT 0,
  config JSONB,
  page_width TEXT DEFAULT 'container',
  page_height TEXT DEFAULT 'auto',
  custom_width INTEGER,
  custom_height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN homepage_sections.page_width IS 'Options: container, full, narrow, custom';
COMMENT ON COLUMN homepage_sections.page_height IS 'Options: auto, full, short, tall, custom';

-- -------------------- CONTENT PAGES --------------------
CREATE TABLE IF NOT EXISTS content_pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  width INTEGER DEFAULT NULL,
  height INTEGER DEFAULT NULL,
  page_width TEXT DEFAULT 'container',
  page_height TEXT DEFAULT 'auto',
  custom_width INTEGER,
  custom_height INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN content_pages.page_width IS 'Options: container, full, narrow, custom';
COMMENT ON COLUMN content_pages.page_height IS 'Options: auto, full, short, tall, custom';

-- ============================================================
-- 4. DELIVERY TABLES (from schema.sql)
-- ============================================================

-- -------------------- DELIVERY ZONES --------------------
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------- DELIVERY CITIES --------------------
CREATE TABLE IF NOT EXISTS delivery_cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  zone_id UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  latitude REAL NOT NULL DEFAULT 0,
  longitude REAL NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------- DELIVERY METHODS --------------------
CREATE TABLE IF NOT EXISTS delivery_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES delivery_cities(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT 'standard',
  price REAL NOT NULL DEFAULT 0,
  estimated_days INTEGER NOT NULL DEFAULT 2,
  estimated_hours INTEGER,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. INDEXES
-- ============================================================

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);

-- Product Variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Customer Addresses
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code_search ON orders(coupon_code) WHERE coupon_code IS NOT NULL;

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Order Timeline
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(start_date, end_date);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type_read ON notifications(type, read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp_desc ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_starred ON notifications(starred) WHERE starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority);
CREATE INDEX IF NOT EXISTS idx_notifications_read_starred ON notifications(read, starred);
CREATE INDEX IF NOT EXISTS idx_notifications_metadata_gin ON notifications USING gin (metadata);

-- Admin Users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Shipping
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone_id ON shipping_methods(zone_id);

-- Store Settings
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);

-- Delivery Tables
CREATE INDEX IF NOT EXISTS idx_cities_zone_id ON delivery_cities(zone_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON delivery_cities(name);
CREATE INDEX IF NOT EXISTS idx_methods_city_id ON delivery_methods(city_id);
CREATE INDEX IF NOT EXISTS idx_methods_zone_id ON delivery_methods(zone_id);
CREATE INDEX IF NOT EXISTS idx_methods_slug ON delivery_methods(slug);

-- ============================================================
-- 6. FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update product_count on categories
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.category_id <> OLD.category_id THEN
    UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-update product rating when review is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE products
    SET rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE products
    SET rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = OLD.product_id AND status = 'approved'),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id AND status = 'approved')
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-update customer stats when order is placed
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customers
    SET total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total,
        last_order_date = NEW.created_at
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customers
    SET total_orders = GREATEST(total_orders - 1, 0),
        total_spent = GREATEST(total_spent - OLD.total, 0)
    WHERE id = OLD.customer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'SDF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment coupon usage (returns INTEGER, respects usage_limit)
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1, updated_at = NOW()
  WHERE id = coupon_id
    AND (usage_limit = 0 OR used_count < usage_limit)
  RETURNING used_count INTO new_count;

  RETURN COALESCE(new_count, -1);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE;

COMMENT ON FUNCTION increment_coupon_usage IS 'Atomically increments coupon.used_count, respecting usage_limit (0 = unlimited). Returns new count or -1 if the guard blocked the increment.';

-- Create admin user (safe function, replaces auth trigger)
CREATE OR REPLACE FUNCTION public.create_admin_user(user_id UUID, user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, name, role, status)
  VALUES (
    user_id,
    user_email,
    COALESCE(user_name, user_email),
    'super_admin',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_admin_user(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pages_updated_at
  BEFORE UPDATE ON content_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_product_count_trigger
  AFTER INSERT OR DELETE OR UPDATE OF category_id ON products
  FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_customer_stats_trigger
  AFTER INSERT OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE TRIGGER trigger_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cities_updated_at
  BEFORE UPDATE ON delivery_cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_methods_updated_at
  BEFORE UPDATE ON delivery_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_methods ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- -------------------- PUBLIC READ POLICIES --------------------

CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can read variants of active products"
  ON product_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.status = 'active'
  ));

CREATE POLICY "Public can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Public can read shipping zones"
  ON shipping_zones FOR SELECT
  USING (true);

CREATE POLICY "Public can read shipping methods"
  ON shipping_methods FOR SELECT
  USING (true);

CREATE POLICY "Public can read store settings"
  ON store_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read coupons"
  ON coupons FOR SELECT
  USING (true);

-- -------------------- AUTHENTICATED USER POLICIES --------------------

CREATE POLICY "Users can read own customer profile"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own customer profile"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read own addresses"
  ON customer_addresses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM customers WHERE customers.id = customer_addresses.customer_id AND customers.id = auth.uid()
  ));

CREATE POLICY "Users can insert own addresses"
  ON customer_addresses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers WHERE customers.id = customer_addresses.customer_id AND customers.id = auth.uid()
  ));

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
  ));

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow all operations for authenticated users"
  ON homepage_sections
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users"
  ON content_pages
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- -------------------- ADMIN POLICIES --------------------

CREATE POLICY "Admin full access to categories"
  ON categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to variants"
  ON product_variants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to orders"
  ON orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to order items"
  ON order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to order timeline"
  ON order_timeline FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to customers"
  ON customers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to reviews"
  ON reviews FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to coupons"
  ON coupons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to notifications"
  ON notifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- admin_users: safe policies from 002 (no recursion)
DROP POLICY IF EXISTS "Admin users access" ON admin_users;

CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin full access to admin_users"
  ON admin_users FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Admin full access to shipping zones"
  ON shipping_zones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to shipping methods"
  ON shipping_methods FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

CREATE POLICY "Admin full access to store settings"
  ON store_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- -------------------- DELIVERY RLS POLICIES --------------------

CREATE POLICY "Allow all for authenticated users" ON delivery_zones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON delivery_cities
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON delivery_methods
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read for anon" ON delivery_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read for anon" ON delivery_cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read for anon" ON delivery_methods
  FOR SELECT USING (is_active = true);

-- ============================================================
-- 10. REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 11. SEED DATA
-- ============================================================

-- -------------------- Homepage Sections --------------------
INSERT INTO homepage_sections (id, name, description, status, "order", config)
VALUES
  ('hero', 'Hero Banner', 'Main hero section with promotional content', 'active', 0, '{}'),
  ('trust-badges', 'Trust Badges', 'Trust badges showing payment and delivery options', 'active', 1, '{}'),
  ('flash-sale', 'Flash Sale', 'Flash sale products countdown', 'active', 2, '{}'),
  ('products', 'Featured Products', 'Curated product selection for homepage', 'active', 3, '{}'),
  ('about', 'About Us', 'About the store and founder', 'active', 4, '{}'),
  ('how-to-order', 'How to Order', 'Steps to order', 'active', 5, '{}'),
  ('testimonials', 'Testimonials', 'Customer reviews and testimonials', 'active', 6, '{}'),
  ('store-visit', 'Store Visit', 'Store location and map', 'active', 7, '{}')
ON CONFLICT (id) DO NOTHING;

-- -------------------- Content Pages --------------------
INSERT INTO content_pages (id, name, slug, content, status)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'About Us', 'about-us', '<h2>About Us</h2><p>Welcome to our store...</p>', 'published'),
  ('a0000001-0000-0000-0000-000000000002', 'Contact Information', 'contact', '<h2>Contact Us</h2><p>Email: info@example.com</p>', 'published'),
  ('a0000001-0000-0000-0000-000000000003', 'FAQ', 'faq', '<h2>Frequently Asked Questions</h2><p>Coming soon...</p>', 'draft'),
  ('a0000001-0000-0000-0000-000000000004', 'Shipping Policy', 'shipping-policy', '<h2>Shipping Policy</h2><p>We ship within 24-48 hours...</p>', 'published'),
  ('a0000001-0000-0000-0000-000000000005', 'Return Policy', 'return-policy', '<h2>Return Policy</h2><p>You can return items within 7 days...</p>', 'published'),
  ('a0000001-0000-0000-0000-000000000006', 'Privacy Policy', 'privacy-policy', '<h2>Privacy Policy</h2><p>Your data is safe with us...</p>', 'published'),
  ('a0000001-0000-0000-0000-000000000007', 'Terms & Conditions', 'terms', '<h2>Terms & Conditions</h2><p>Please read carefully...</p>', 'published')
ON CONFLICT (id) DO NOTHING;

-- -------------------- Notification Preferences --------------------
INSERT INTO store_settings (key, value) VALUES
  ('notify_new_orders', 'true'),
  ('notify_low_stock', 'true'),
  ('notify_new_reviews', 'true'),
  ('notify_payments', 'true'),
  ('notify_daily_reports', 'true'),
  ('notify_system_errors', 'true'),
  ('notify_security_events', 'true'),
  ('notify_new_customers', 'true'),
  ('notify_product', 'true'),
  ('notify_shipping', 'true'),
  ('notify_promotion', 'true'),
  ('notify_social', 'true'),
  ('notify_account', 'true'),
  ('notify_message', 'true'),
  ('notify_achievement', 'true'),
  ('notify_reminder', 'true'),
  ('notify_subscription', 'true'),
  ('notify_support', 'true'),
  ('notify_analytics', 'true'),
  ('notify_team', 'true'),
  ('notify_event', 'true'),
  ('notify_custom', 'true')
ON CONFLICT (key) DO NOTHING;

-- -------------------- Example Notifications --------------------
DO $$
DECLARE
  cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM notifications;
  IF cnt < 15 THEN
    INSERT INTO notifications (type, title, message, read, starred, priority, action_url, metadata, timestamp) VALUES
      ('order', 'New order received!', 'Customer Fatima Zahra placed order #SDF-2026-0847 for 3 items — 249.99 MAD. Ship within 24h.', false, true, 'urgent', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0847','amount',249.99,'items',3), NOW() - INTERVAL '2 hours'),
      ('review', 'New 5-star review', 'Sarah Johnson left a 5-star review for "Premium Wireless Headphones" — "Absolutely love it!"', false, false, 'high', '/dashboard/reviews', jsonb_build_object('productId','PROD-2024-001','productName','Premium Wireless Headphones','rating',5), NOW() - INTERVAL '5 hours'),
      ('payment', 'Payment confirmed', 'Payment of 89.99 MAD for order #SDF-2026-0846 has been confirmed via COD.', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0846','amount',89.99), NOW() - INTERVAL '1 day'),
      ('shipping', 'Package shipped', 'Order #SDF-2026-0846 has been shipped. Tracking: TRK-7890-1234-5678 via Express.', false, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0846','trackingNumber','TRK-7890-1234-5678'), NOW() - INTERVAL '2 days'),
      ('promotion', 'Flash sale: 20% off accessories!', 'Limited time: 20% off all accessories for 24h. Use code FLASH20.', false, true, 'high', '/dashboard/coupons', jsonb_build_object('promotionCode','FLASH20','discount',20,'category','accessories'), NOW() - INTERVAL '3 hours'),
      ('system', 'System maintenance scheduled', 'Scheduled maintenance Dec 15, 2024 02:00–04:00 UTC — expect 2h downtime.', true, false, 'medium', '/dashboard/settings', jsonb_build_object('maintenanceWindow','2024-12-15 02:00:00','duration','2 hours'), NOW() - INTERVAL '3 days'),
      ('social', 'New follower alert', 'Jessica Martinez started following your store. Connect with your new follower!', false, false, 'low', '/dashboard/customers', jsonb_build_object('followerName','Jessica Martinez'), NOW() - INTERVAL '4 days'),
      ('inventory', 'Low stock warning', 'Product "Wireless Charging Pad" has only 5 units remaining. Restock soon.', false, false, 'high', '/dashboard/inventory', jsonb_build_object('productName','Wireless Charging Pad','currentStock',5,'reorderLevel',10), NOW() - INTERVAL '1 day'),
      ('security', 'New login detected', 'New login from Paris, France on iPhone 15 Pro — if this wasn''t you, change your password.', false, true, 'urgent', '/dashboard/settings', jsonb_build_object('location','Paris, France','device','iPhone 15 Pro'), NOW() - INTERVAL '1 hour'),
      ('product', 'Back in stock!', 'Product "Noise-Canceling Headphones" is back in stock — available in all colors.', false, false, 'medium', '/dashboard/products', jsonb_build_object('productName','Noise-Canceling Headphones','availableColors', jsonb_build_array('Black','White','Blue')), NOW() - INTERVAL '12 hours'),
      ('review', 'Review reply received', 'Admin replied to your review for "Smart Watch Pro". Check the response.', true, false, 'low', '/dashboard/reviews', jsonb_build_object('productName','Smart Watch Pro','reviewId','REV-2024-001'), NOW() - INTERVAL '2 days'),
      ('order', 'Order delivered successfully', 'Order #SDF-2026-0841 has been delivered. Thank you for shopping with us!', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0841'), NOW() - INTERVAL '6 hours'),
      ('system', 'Welcome to SODFA Marketplace!', 'We''re excited to have you on board. Explore 100% natural Moroccan beauty & skincare.', true, false, 'low', '/dashboard', jsonb_build_object('welcome', true), NOW() - INTERVAL '7 days'),
      ('inventory', 'Out of stock — urgent', 'Volumizing Mascara - Black (Brown variant) is out of stock. 0 units.', false, false, 'urgent', '/dashboard/inventory', jsonb_build_object('productName','Volumizing Mascara - Black','currentStock',0), NOW() - INTERVAL '30 minutes'),
      ('payment', '3 orders have pending COD payments', '3 orders have pending Cash on Delivery payments — total 412.50 MAD.', false, false, 'high', '/dashboard/payments', jsonb_build_object('pendingOrders',3,'totalPending',412.50), NOW() - INTERVAL '8 hours'),
      ('customer', 'New Customer — Hajar Amrani', 'Hajar Amrani registered on SODFA MARKETPLACE — welcome her!', true, false, 'medium', '/dashboard/customers', jsonb_build_object('customerName','Hajar Amrani'), NOW() - INTERVAL '5 days'),
      ('stock', 'Low Stock Alert — Glossy Lipstick', 'Glossy Lipstick - Rose Gold has only 8 units remaining.', false, false, 'high', '/dashboard/inventory', jsonb_build_object('productName','Glossy Lipstick - Rose Gold','currentStock',8), NOW() - INTERVAL '9 hours'),
      ('shipping', 'Delivery delayed — weather', 'Your delivery for order #SDF-2026-0842 has been delayed due to weather conditions.', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0842','reason','weather'), NOW() - INTERVAL '1 day 3 hours'),
      ('product', 'New arrival: Argan Hair Serum', 'New product "Argan Hair Serum — 100% Natural" is now available in store.', false, false, 'low', '/dashboard/products', jsonb_build_object('productName','Argan Hair Serum'), NOW() - INTERVAL '6 days'),
      ('security', 'Security check — 2FA enabled', 'Two-factor authentication was enabled for your admin account.', true, true, 'high', '/dashboard/settings', jsonb_build_object('action','2FA enabled'), NOW() - INTERVAL '2 days 4 hours'),
      ('promotion', 'Promotion ending soon', 'Your "WELCOME20" coupon expires in 3 hours — 124 uses remaining.', false, false, 'urgent', '/dashboard/coupons', jsonb_build_object('code','WELCOME20','usesLeft',124), NOW() - INTERVAL '45 minutes'),
      ('order', 'Order cancelled by customer', 'Order #SDF-2026-0843 was cancelled by Nadia Chraibi — refund initiated.', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0843','customerName','Nadia Chraibi'), NOW() - INTERVAL '10 days'),
      ('customer', 'Customer message — Fatima', 'Fatima Zahra sent a message: "When will my order arrive?"', false, false, 'low', '/dashboard/customers', jsonb_build_object('customerName','Fatima Zahra'), NOW() - INTERVAL '15 hours'),
      ('review', 'New 3-star review — needs attention', 'Yasmine Toumi left a 3-star review on "Volumizing Mascara" — check feedback.', false, false, 'high', '/dashboard/reviews', jsonb_build_object('productName','Volumizing Mascara','rating',3), NOW() - INTERVAL '18 hours');
  END IF;
END $$;

-- -------------------- Additional Notification Types (009) --------------------
DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM notifications WHERE type::text IN ('account','message','achievement','reminder','subscription','support','analytics','team','event','custom');
  IF cnt < 10 THEN
    INSERT INTO notifications (type, title, message, read, starred, priority, action_url, metadata, timestamp) VALUES
      ('account', 'Account updated', 'Your password was changed successfully from Casablanca.', true, false, 'medium', '/dashboard/settings', jsonb_build_object('action','password_change'), NOW() - INTERVAL '3 days'),
      ('message', 'New message from Sarah', 'Sarah J. sent you a message: "Is this still available?"', false, false, 'medium', '/dashboard/customers', jsonb_build_object('senderName','Sarah J.','messagePreview','Is this still available?'), NOW() - INTERVAL '4 hours'),
      ('achievement', 'Achievement unlocked!', 'You earned the "100 Sales" badge — congratulations!', false, true, 'low', '/dashboard/analytics', jsonb_build_object('achievementName','100 Sales'), NOW() - INTERVAL '2 days'),
      ('reminder', 'Reminder: Complete your profile', 'Don''t forget to complete your store profile by Dec 20th.', false, false, 'medium', '/dashboard/settings', jsonb_build_object('dueDate','2024-12-20'), NOW() - INTERVAL '1 day'),
      ('subscription', 'Subscription renewed', 'Your Pro Plan subscription has been renewed — next billing Jan 15.', true, false, 'high', '/dashboard/settings', jsonb_build_object('planName','Pro Plan'), NOW() - INTERVAL '5 days'),
      ('support', 'Support ticket #12345 resolved', 'Your support request has been resolved by Agent Karim.', false, false, 'high', '/dashboard/support', jsonb_build_object('ticketId','12345'), NOW() - INTERVAL '6 hours'),
      ('analytics', 'Weekly report ready', 'Revenue reached $5,000 (+15%) this week — view insights.', true, false, 'low', '/dashboard/analytics', jsonb_build_object('metric','revenue','value',5000), NOW() - INTERVAL '7 days'),
      ('team', 'Alex mentioned you', 'Alex M. mentioned you in Project Alpha — check the comment.', false, false, 'medium', '/dashboard/team', jsonb_build_object('userName','Alex M.'), NOW() - INTERVAL '9 hours'),
      ('event', 'Black Friday Sale is coming!', 'Black Friday Sale starts Nov 24th — prepare your store!', false, false, 'medium', '/dashboard/events', jsonb_build_object('eventName','Black Friday Sale'), NOW() - INTERVAL '10 days'),
      ('custom', 'Custom plugin notification', 'A custom integration sent a notification — check details.', false, false, 'medium', '/dashboard/settings', jsonb_build_object('source','plugin'), NOW() - INTERVAL '12 hours')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 12. DELIVERY SEED DATA (from schema.sql)
-- ============================================================

-- Zones
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

-- Cities
INSERT INTO delivery_cities (id, name, name_ar, zone_id, latitude, longitude, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Casablanca',  'الدار البيضاء', 'a1000000-0000-0000-0000-000000000001', 33.5731, -7.5898, true),
  ('b1000000-0000-0000-0000-000000000002', 'Mohammedia',  'المحمدية',      'a1000000-0000-0000-0000-000000000001', 33.6866, -7.3830, true),
  ('b1000000-0000-0000-0000-000000000003', 'Berrechid',    'برشيد',          'a1000000-0000-0000-0000-000000000001', 33.2654, -7.5866, true),
  ('b1000000-0000-0000-0000-000000000004', 'El Jadida',    'الجديدة',       'a1000000-0000-0000-0000-000000000001', 33.2549, -8.5009, true),
  ('b1000000-0000-0000-0000-000000000005', 'Rabat',        'الرباط',        'a1000000-0000-0000-0000-000000000002', 34.0209, -6.8416, true),
  ('b1000000-0000-0000-0000-000000000006', 'Khemisset',    'الخميسات',      'a1000000-0000-0000-0000-000000000002', 33.8241, -6.0664, true),
  ('b1000000-0000-0000-0000-000000000007', 'Kénitra',      'القنيطرة',     'a1000000-0000-0000-0000-000000000002', 34.2610, -6.5802, true),
  ('b1000000-0000-0000-0000-000000000008', 'Marrakech',    'مراكش',        'a1000000-0000-0000-0000-000000000003', 31.6295, -7.9811, true),
  ('b1000000-0000-0000-0000-000000000009', 'Safi',         'آسفي',         'a1000000-0000-0000-0000-000000000003', 32.2994, -9.2372, true),
  ('b1000000-0000-0000-0000-000000000010', 'Essaouira',    'الصويرة',      'a1000000-0000-0000-0000-000000000003', 31.5085, -9.7595, true),
  ('b1000000-0000-0000-0000-000000000011', 'Fès',          'فاس',          'a1000000-0000-0000-0000-000000000004', 34.0331, -5.0003, true),
  ('b1000000-0000-0000-0000-000000000012', 'Meknès',       'مكناس',        'a1000000-0000-0000-0000-000000000004', 33.8935, -5.5473, true),
  ('b1000000-0000-0000-0000-000000000013', 'Ifrane',       'إفران',        'a1000000-0000-0000-0000-000000000004', 33.5228, -5.1107, true),
  ('b1000000-0000-0000-0000-000000000014', 'Azrou',        'عزرو',         'a1000000-0000-0000-0000-000000000004', 33.4344, -5.2217, true),
  ('b1000000-0000-0000-0000-000000000015', 'Tanger',       'طنجة',         'a1000000-0000-0000-0000-000000000005', 35.7595, -5.8340, true),
  ('b1000000-0000-0000-0000-000000000016', 'Tétouan',      'تطوان',        'a1000000-0000-0000-0000-000000000005', 35.5889, -5.3626, true),
  ('b1000000-0000-0000-0000-000000000017', 'Chefchaouen',  'شفشاون',       'a1000000-0000-0000-0000-000000000005', 35.1714, -5.2697, true),
  ('b1000000-0000-0000-0000-000000000018', 'Agadir',       'أكادير',       'a1000000-0000-0000-0000-000000000006', 30.4278, -9.5981, true),
  ('b1000000-0000-0000-0000-000000000019', 'Tiznit',       'تيزنيت',       'a1000000-0000-0000-0000-000000000006', 29.6974, -9.8022, true),
  ('b1000000-0000-0000-0000-000000000020', 'Oujda',        'وجدة',         'a1000000-0000-0000-0000-000000000007', 34.6867, -1.9114, true),
  ('b1000000-0000-0000-0000-000000000021', 'Berkane',      'بركان',        'a1000000-0000-0000-0000-000000000007', 35.0543, -2.9214, true),
  ('b1000000-0000-0000-0000-000000000022', 'Nador',        'الناظور',      'a1000000-0000-0000-0000-000000000007', 35.1688, -2.9286, true),
  ('b1000000-0000-0000-0000-000000000023', 'Errachidia',   'الراشيدية',    'a1000000-0000-0000-0000-000000000008', 31.9314, -4.4269, true),
  ('b1000000-0000-0000-0000-000000000024', 'Ouarzazate',   'ورزازات',      'a1000000-0000-0000-0000-000000000008', 30.9197, -6.8933, true),
  ('b1000000-0000-0000-0000-000000000025', 'Midelt',       'ميدلت',        'a1000000-0000-0000-0000-000000000008', 32.6853, -4.7381, true)
ON CONFLICT (id) DO NOTHING;

-- Delivery Methods
INSERT INTO delivery_methods (city_id, zone_id, name, slug, price, estimated_days, estimated_hours, description, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Standard Delivery', 'standard', 30, 2, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Express Delivery',  'express',  50, 1, 24,   'Fast express delivery', true),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Standard Delivery', 'standard', 35, 2, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Standard Delivery', 'standard', 30, 2, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Express Delivery',  'express',  50, 1, 24,   'Fast express delivery', true),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Standard Delivery', 'standard', 35, 3, NULL, 'Standard delivery', false),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Standard Delivery', 'standard', 35, 3, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Express Delivery',  'express',  60, 1, 24,   'Fast express delivery', true),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'Standard Delivery', 'standard', 35, 3, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'Standard Delivery', 'standard', 40, 3, NULL, 'Standard delivery', true),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Standard Delivery', 'standard', 40, 3, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Express Delivery',  'express',  65, 1, 24,   'Fast express delivery', true),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000006', 'Standard Delivery', 'standard', 40, 3, NULL, 'Standard home delivery', true),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000007', 'Standard Delivery', 'standard', 45, 4, NULL, 'Standard delivery', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- END OF SHOPPING.SQL
-- ============================================================
