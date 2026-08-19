-- ============================================================
-- SODFA STORE - Initial Database Schema
-- Migration: 001_initial_schema
-- Description: Core tables for e-commerce beauty store
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'credit_card', 'bank_transfer', 'mobile_payment');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE coupon_applicable_to AS ENUM ('all', 'products', 'categories', 'customers');
CREATE TYPE coupon_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE notification_type AS ENUM ('order', 'customer', 'stock', 'review', 'payment', 'system');
CREATE TYPE admin_role AS ENUM ('super_admin', 'manager', 'editor', 'support');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'blocked');
CREATE TYPE category_status AS ENUM ('active', 'inactive');

-- ============================================================
-- TABLES
-- ============================================================

-- -------------------- CATEGORIES --------------------
CREATE TABLE categories (
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
CREATE TABLE products (
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
CREATE TABLE product_variants (
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
CREATE TABLE customers (
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
CREATE TABLE customer_addresses (
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
CREATE TABLE orders (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- ORDER ITEMS --------------------
CREATE TABLE order_items (
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
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  note TEXT DEFAULT NULL
);

-- -------------------- REVIEWS --------------------
CREATE TABLE reviews (
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
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  discount_type coupon_discount_type DEFAULT 'percentage',
  discount_value DECIMAL(12,2) NOT NULL,
  minimum_order DECIMAL(12,2) DEFAULT 0,
  maximum_discount DECIMAL(12,2) DEFAULT NULL,
  applicable_to coupon_applicable_to DEFAULT 'all',
  applicable_ids TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  customer_usage_limit INTEGER DEFAULT 1,
  status coupon_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- NOTIFICATIONS --------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type notification_type DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500) DEFAULT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- ADMIN USERS --------------------
CREATE TABLE admin_users (
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
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- SHIPPING METHODS --------------------
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) DEFAULT 0,
  estimated_days VARCHAR(50) DEFAULT '3-5 days',
  free_shipping_threshold DECIMAL(12,2) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------- STORE SETTINGS --------------------
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_rating ON products(rating DESC);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_order_timeline_order_id ON order_timeline(order_id);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_status ON reviews(status);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);

CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp DESC);

CREATE INDEX idx_admin_users_email ON admin_users(email);

CREATE INDEX idx_shipping_methods_zone_id ON shipping_methods(zone_id);

CREATE INDEX idx_store_settings_key ON store_settings(key);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
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

-- ============================================================
-- PUBLIC READ POLICIES (for website visitors)
-- ============================================================

-- Categories: public read
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (status = 'active');

-- Products: public read of active products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (status = 'active');

-- Product variants: public read
CREATE POLICY "Public can read variants of active products"
  ON product_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.status = 'active'
  ));

-- Reviews: public read of approved reviews
CREATE POLICY "Public can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Shipping zones: public read
CREATE POLICY "Public can read shipping zones"
  ON shipping_zones FOR SELECT
  USING (true);

-- Shipping methods: public read
CREATE POLICY "Public can read shipping methods"
  ON shipping_methods FOR SELECT
  USING (true);

-- Store settings: public read
CREATE POLICY "Public can read store settings"
  ON store_settings FOR SELECT
  USING (true);

-- ============================================================
-- AUTHENTICATED USER POLICIES
-- ============================================================

-- Customers: authenticated users can read/update their own profile
CREATE POLICY "Users can read own customer profile"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own customer profile"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

-- Customer addresses: own addresses
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

-- Orders: users can read own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

-- Order items: read own order items
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
  ));

-- Reviews: authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- ============================================================
-- ADMIN POLICIES (service_role bypasses RLS)
-- This means admin API routes using service_role key have full access
-- ============================================================

-- For admin operations via anon key, we check if user is in admin_users table
-- Categories: admin full access
CREATE POLICY "Admin full access to categories"
  ON categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Products: admin full access
CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Product variants: admin full access
CREATE POLICY "Admin full access to variants"
  ON product_variants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Orders: admin full access
CREATE POLICY "Admin full access to orders"
  ON orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Order items: admin full access
CREATE POLICY "Admin full access to order items"
  ON order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Order timeline: admin full access
CREATE POLICY "Admin full access to order timeline"
  ON order_timeline FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Customers: admin full access
CREATE POLICY "Admin full access to customers"
  ON customers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Reviews: admin can approve/reject/delete
CREATE POLICY "Admin full access to reviews"
  ON reviews FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Coupons: admin full access
CREATE POLICY "Admin full access to coupons"
  ON coupons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Notifications: admin full access
CREATE POLICY "Admin full access to notifications"
  ON notifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Admin users: admin full access (super_admin can manage all)
CREATE POLICY "Admin users access"
  ON admin_users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Shipping zones: admin full access
CREATE POLICY "Admin full access to shipping zones"
  ON shipping_zones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Shipping methods: admin full access
CREATE POLICY "Admin full access to shipping methods"
  ON shipping_methods FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- Store settings: admin full access
CREATE POLICY "Admin full access to store settings"
  ON store_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.status = 'active'
  ));

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER update_category_product_count_trigger
  AFTER INSERT OR DELETE OR UPDATE OF category_id ON products
  FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

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

CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

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

CREATE TRIGGER update_customer_stats_trigger
  AFTER INSERT OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'SDF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();