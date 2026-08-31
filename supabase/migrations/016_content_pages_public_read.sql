-- ============================================================
-- Allow public (anon) to read published content_pages
-- Fixes footers on homepage/store showing empty popups for guests
-- ============================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Allow anon + authenticated to read published pages
DROP POLICY IF EXISTS "Allow public read published" ON content_pages;
CREATE POLICY "Allow public read published" ON content_pages
  FOR SELECT
  USING (status = 'published');

-- Keep existing authenticated full access (re-create if missing)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON content_pages;
CREATE POLICY "Allow all for authenticated users" ON content_pages
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Ensure cookies page exists (idempotent)
INSERT INTO content_pages (name, slug, content, status)
VALUES (
  'Cookies Policy',
  'cookies',
  '<h2>🍪 سياسة الكوكيز</h2><p>نحفظ فقط تفضيلاتك المحلية مثل اختيار الألوان وترتيب الأقسام في جهازك.</p><p>لا نستخدم كوكيز تتبع إعلاني ولا نشارك أي بيانات تصفح مع أطراف خارجية.</p><p><b>إدارة الكوكيز:</b> يمكنك مسح الكوكيز من إعدادات المتصفح في أي وقت.</p>',
  'published'
)
ON CONFLICT (slug) DO NOTHING;

-- Ensure page dimensions columns exist (for older DBs)
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS page_width TEXT DEFAULT 'container';
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS page_height TEXT DEFAULT 'auto';
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS custom_width INTEGER;
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS custom_height INTEGER;
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS height INTEGER;
