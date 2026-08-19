-- Drop and recreate if needed
DROP TABLE IF EXISTS homepage_sections;

CREATE TABLE homepage_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  "order" INTEGER DEFAULT 0,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default sections
INSERT INTO homepage_sections (id, name, description, status, "order", config)
VALUES
  ('hero', 'Hero Banner', 'Main hero section with promotional content', 'active', 0, '{}'),
  ('trust-badges', 'Trust Badges', 'Trust badges showing payment and delivery options', 'active', 1, '{}'),
  ('flash-sale', 'Flash Sale', 'Flash sale products countdown', 'active', 2, '{}'),
  ('products', 'Featured Products', 'Curated product selection for homepage', 'active', 3, '{}'),
  ('about', 'About Us', 'About the store and founder', 'active', 4, '{}'),
  ('how-to-order', 'How to Order', 'Steps to order', 'active', 5, '{}'),
  ('testimonials', 'Testimonials', 'Customer reviews and testimonials', 'active', 6, '{}'),
  ('store-visit', 'Store Visit', 'Store location and map', 'active', 7, '{}');


  ALTER TABLE homepage_sections DISABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow all operations for authenticated users" ON homepage_sections
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');




-- Drop the existing table if needed (careful in production)
DROP TABLE IF EXISTS content_pages CASCADE;

CREATE TABLE content_pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  width INTEGER DEFAULT NULL,
  height INTEGER DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
 
CREATE POLICY "Allow all for authenticated users" ON content_pages
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
 
-- Insert some default pages
INSERT INTO content_pages (name, slug, content, status)
VALUES
  ('About Us', 'about-us', '<h2>About Us</h2><p>Welcome to our store...</p>', 'published'),
  ('Contact Information', 'contact', '<h2>Contact Us</h2><p>Email: info@example.com</p>', 'published'),
  ('FAQ', 'faq', '<h2>Frequently Asked Questions</h2><p>Coming soon...</p>', 'draft'),
  ('Shipping Policy', 'shipping-policy', '<h2>Shipping Policy</h2><p>We ship within 24-48 hours...</p>', 'published'),
  ('Return Policy', 'return-policy', '<h2>Return Policy</h2><p>You can return items within 7 days...</p>', 'published'),
  ('Privacy Policy', 'privacy-policy', '<h2>Privacy Policy</h2><p>Your data is safe with us...</p>', 'published'),
  ('Terms & Conditions', 'terms', '<h2>Terms & Conditions</h2><p>Please read carefully...</p>', 'published');


 

-- Optional: set some defaults for existing pages
ALTER TABLE content_pages 
ADD COLUMN page_width TEXT DEFAULT 'container',
ADD COLUMN page_height TEXT DEFAULT 'auto',
ADD COLUMN custom_width INTEGER,
ADD COLUMN custom_height INTEGER;

COMMENT ON COLUMN content_pages.page_width IS 'Options: container, full, narrow, custom';
COMMENT ON COLUMN content_pages.page_height IS 'Options: auto, full, short, tall, custom';
