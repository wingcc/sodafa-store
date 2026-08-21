-- ============================================================================
-- SODFA — Homepage Sections: migrate to the full 16-section layout
-- PostgreSQL (Supabase) — run in Supabase Dashboard → SQL Editor
--
-- Transfers the full section structure from public/json/config.json
-- (hero, stats, trust, flash, oils, benefits, video,
--  cases, about, products, reviews, faq, order, cta, store, footer)
-- into the homepage_sections table.
--
-- NOTE: the previous 8-section set used different ids for the same concepts
-- (trust-badges→trust, flash-sale→flash, how-to-order→order,
--  testimonials→reviews, store-visit→store). Those legacy rows are removed
-- below to avoid duplicates. 'soya-product-hero' is also removed (merged
-- into 'hero'). Skip the DELETE block if you want to keep them.
-- Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- OPTIONAL CLEANUP: remove legacy-id rows replaced by the new convention
-- ---------------------------------------------------------------------------
delete from public.homepage_sections
where id in ('trust-badges', 'flash-sale', 'how-to-order', 'testimonials', 'store-visit', 'soya-product-hero');

-- ---------------------------------------------------------------------------
-- INSERT the full 16-section layout (order matches config.json)
-- ---------------------------------------------------------------------------
insert into public.homepage_sections (id, name, description, status, "order") values
  ('hero',             'البطل الرئيسي',      'Main hero section with promotional content',        'active',   0),
  ('stats',            'الإحصائيات',         'Animated statistics counters',                      'active',   2),
  ('trust',            'الثقة',              'Trust badges showing payment and delivery options', 'active',   3),
  ('flash',            'العروض السريعة',     'Flash sale products countdown',                     'inactive', 4),
  ('oils',             'الزيوت',             'Natural oils showcase',                             'active',   5),
  ('benefits',         'المميزات',           'Serum benefits and features grid',                  'active',   6),
  ('video',            'الفيديو',            'Promotional video section',                         'active',   7),
  ('cases',            'قبل وبعد',           'Before and after results gallery',                  'active',   8),
  ('about',            'من نحن',             'About the store and founder',                       'active',   9),
  ('products',         'المنتجات',           'Featured products grid',                            'inactive', 10),
  ('reviews',          'التقييمات',          'Customer reviews and testimonials',                 'active',   11),
  ('faq',              'الأسئلة الشائعة',    'Frequently asked questions accordion',              'active',   12),
  ('order',            'طريقة الطلب',        'How to order steps',                                'active',   13),
  ('cta',              'دعوة للعمل',         'Call to action banner',                             'active',   14),
  ('store',            'المتجر',             'Store location and map',                            'active',   15),
  ('footer',           'التذييل',            'Page footer',                                       'active',   16)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  "order"     = excluded."order";

-- ============================================================================
-- DONE ✓ — 16 sections now managed from Dashboard → Store Management → Homepage
-- ============================================================================
