-- ============================================================
-- SODFA STORE - Seed Data
-- ============================================================

-- ============================================================
-- STORE SETTINGS
-- ============================================================
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'SODFA Store'),
  ('store_description', 'Your premium destination for beauty, skincare, and wellness products in Morocco.'),
  ('logo', '/assets/images/logo.png'),
  ('favicon', '/favicon.ico'),
  ('contact_email', 'contact@sodafa.ma'),
  ('contact_phone', '+212-5XX-XXXXXX'),
  ('currency', 'MAD'),
  ('language', 'ar'),
  ('tax_rate', '20'),
  ('free_shipping_threshold', '500');

-- ============================================================
-- ADMIN USERS
-- ============================================================
INSERT INTO admin_users (id, name, email, role, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'admin@sodafa.ma', 'super_admin', 'active');

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, description, image, product_count, status, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Skincare', 'skincare', 'Face and body skincare products', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300', 0, 'active', 1),
  ('10000000-0000-0000-0000-000000000002', 'Hair Care', 'hair-care', 'Products for hair care and styling', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300', 0, 'active', 2),
  ('10000000-0000-0000-0000-000000000003', 'Supplements', 'supplements', 'Vitamins, minerals, and nutritional supplements', 'https://images.unsplash.com/photo-1694150001431-9fa9cc9c4c83?w=300', 0, 'active', 3),
  ('10000000-0000-0000-0000-000000000004', 'Body Care', 'body-care', 'Body care and wellness products', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300', 0, 'active', 4),
  ('10000000-0000-0000-0000-000000000005', 'Devices', 'devices', 'Beauty tools and devices', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300', 0, 'active', 5),
  ('10000000-0000-0000-0000-000000000006', 'Nutrition', 'nutrition', 'Protein and nutrition products', 'https://images.unsplash.com/photo-1600180758895-2f4159c47c56?w=300', 0, 'active', 6),
  ('10000000-0000-0000-0000-000000000007', 'Cosmetic Oils', 'cosmetic-oils', 'Pure and blended cosmetic oils', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300', 0, 'active', 7),
  ('10000000-0000-0000-0000-000000000008', 'Makeup', 'makeup', 'Cosmetics and makeup products', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300', 0, 'active', 8),
  ('10000000-0000-0000-0000-000000000009', 'Accessories', 'accessories', 'Beauty tools and accessories', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300', 0, 'active', 9);

-- Subcategories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count, status, sort_order) VALUES
  -- Hair Care subcategories
  ('10000000-0000-0000-0001-000000000001', 'Hair Oils', 'hair-oils', 'Natural hair oils', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=300', '10000000-0000-0000-0000-000000000002', 0, 'active', 1),
  ('10000000-0000-0000-0001-000000000002', 'Shampoos', 'shampoos', 'Hair cleansing products', 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=300', '10000000-0000-0000-0000-000000000002', 0, 'active', 2),
  ('10000000-0000-0000-0001-000000000003', 'Hair Masks', 'hair-masks', 'Deep conditioning treatments', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300', '10000000-0000-0000-0000-000000000002', 0, 'active', 3),
  ('10000000-0000-0000-0001-000000000004', 'Hair Styling', 'hair-styling', 'Styling products and tools', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300', '10000000-0000-0000-0000-000000000002', 0, 'active', 4),
  -- Skincare subcategories
  ('10000000-0000-0000-0001-000000000005', 'Face Oils', 'face-oils', 'Facial oils and serums', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300', '10000000-0000-0000-0000-000000000001', 0, 'active', 1),
  ('10000000-0000-0000-0001-000000000006', 'Creams', 'creams', 'Moisturizers and creams', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300', '10000000-0000-0000-0000-000000000001', 0, 'active', 2),
  ('10000000-0000-0000-0001-000000000007', 'Cleansers', 'cleansers', 'Face cleansers', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300', '10000000-0000-0000-0000-000000000001', 0, 'active', 3),
  -- Cosmetic Oils subcategories
  ('10000000-0000-0000-0001-000000000008', 'Argan Oil', 'argan-oil', 'Pure Moroccan argan oil', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300', '10000000-0000-0000-0000-000000000007', 0, 'active', 1),
  ('10000000-0000-0000-0001-000000000009', 'Rose Oil', 'rose-oil', 'Rose essential oil', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=300', '10000000-0000-0000-0000-000000000007', 0, 'active', 2),
  ('10000000-0000-0000-0001-000000000010', 'Prickly Pear Oil', 'prickly-pear-oil', 'Cactus seed oil', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300', '10000000-0000-0000-0000-000000000007', 0, 'active', 3),
  -- Makeup subcategories
  ('10000000-0000-0000-0001-000000000011', 'Foundation', 'foundation', 'Face foundation', 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=300', '10000000-0000-0000-0000-000000000008', 0, 'active', 1),
  ('10000000-0000-0000-0001-000000000012', 'Lipstick', 'lipstick', 'Lip products', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300', '10000000-0000-0000-0000-000000000008', 0, 'active', 2),
  ('10000000-0000-0000-0001-000000000013', 'Mascara', 'mascara', 'Eye makeup', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300', '10000000-0000-0000-0000-000000000008', 0, 'active', 3);

-- ============================================================
-- PRODUCTS (from ALL_PRODUCTS.ts)
-- ============================================================
INSERT INTO products (id, name, slug, short_description, full_description, sku, brand, category_id, tags, regular_price, sale_price, cost_price, stock, low_stock_threshold, images, status, featured, total_sold, rating, review_count) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Hydra-Boost Vitamin C Serum',
    'hydra-boost-vitamin-c-serum',
    'Brightening vitamin C serum for radiant, even-toned skin.',
    'Our Hydra-Boost Vitamin C Serum is formulated with 20% L-Ascorbic Acid, hyaluronic acid, and vitamin E to brighten skin tone, reduce dark spots, and boost collagen production. Suitable for all skin types.',
    'CL-VCS-001',
    'ClearLab',
    '10000000-0000-0000-0000-000000000001',
    ARRAY['vitamin c', 'serum', 'brightening', 'skincare'],
    34.99, 44.99, 15.00, 150, 20,
    '["https://images.unsplash.com/photo-1730968856900-1d661cf77b74"]'::jsonb,
    'active', TRUE, 860, 4.8, 312
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Daily Collagen Complex 60ct',
    'daily-collagen-complex-60ct',
    'Advanced collagen supplement for skin elasticity and joint health.',
    'Daily Collagen Complex provides types I, II & III collagen peptides with vitamin C and biotin. Supports skin elasticity, hair strength, nail growth, and joint mobility. 60 capsules per bottle.',
    'NC-COL-001',
    'NutraCo',
    '10000000-0000-0000-0000-000000000003',
    ARRAY['collagen', 'supplement', 'skin', 'joints'],
    49.99, NULL, 22.00, 200, 25,
    '["https://images.unsplash.com/photo-1694150001431-9fa9cc9c4c83"]'::jsonb,
    'active', TRUE, 740, 4.9, 540
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Microcurrent Facial Toning Device',
    'microcurrent-facial-toning-device',
    'Professional-grade microcurrent device for facial toning and lifting.',
    'This advanced microcurrent device uses low-level electrical currents to stimulate facial muscles, improve contour, and reduce fine lines. Features 5 intensity levels, LED display, and ergonomic design.',
    'TW-FTD-001',
    'TechWell',
    '10000000-0000-0000-0000-000000000005',
    ARRAY['microcurrent', 'device', 'facial', 'anti-aging'],
    149.00, 199.00, 65.00, 45, 10,
    '["https://cdn.shopify.com/s/files/1/0956/6208/0301/files/Create_ONE_high-end_fashion_collage_202606301753-ezgif.com-jpg-to-webp-converter.webp?v=1782835836"]'::jsonb,
    'active', FALSE, 430, 4.6, 87
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Deep Repair Argan Body Oil',
    'deep-repair-argan-body-oil',
    'Rich argan body oil for deep moisturizing and skin repair.',
    'Formulated with pure Moroccan argan oil, vitamin E, and jojoba oil, this body oil absorbs quickly to deeply moisturize and repair dry, damaged skin. Leaves skin silky smooth with a natural glow.',
    'BL-ABO-001',
    'BodyLux',
    '10000000-0000-0000-0000-000000000004',
    ARRAY['argan oil', 'body oil', 'moisturizing', 'natural'],
    28.99, 36.00, 12.00, 120, 15,
    '["https://images.unsplash.com/photo-1618330834871-dd22c2c226ca"]'::jsonb,
    'active', FALSE, 610, 4.7, 198
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'Whey Protein Isolate Vanilla 2lb',
    'whey-protein-isolate-vanilla-2lb',
    'Premium whey protein isolate for muscle recovery and growth.',
    'Pure whey protein isolate with 25g protein per serving, low in fat and carbs. Naturally flavored with real vanilla. Perfect for post-workout recovery, meal replacement, or adding to smoothies.',
    'PF-WPI-001',
    'ProForm',
    '10000000-0000-0000-0000-000000000006',
    ARRAY['protein', 'whey', 'nutrition', 'fitness'],
    59.99, NULL, 28.00, 85, 15,
    '["https://img.rocket.new/generatedImages/rocket_gen_img_13ea61377-1784992504314.png"]'::jsonb,
    'active', FALSE, 520, 4.8, 423
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'Retinol Night Renewal Cream',
    'retinol-night-renewal-cream',
    'Anti-aging night cream with retinol for skin renewal while you sleep.',
    'A powerful overnight treatment combining 0.5% retinol with peptides and ceramides. Reduces fine lines, improves texture, and promotes cell turnover. Wake up to visibly smoother, younger-looking skin.',
    'CL-RNC-001',
    'ClearLab',
    '10000000-0000-0000-0000-000000000001',
    ARRAY['retinol', 'night cream', 'anti-aging', 'skincare'],
    42.50, 55.00, 18.00, 95, 10,
    '["https://images.unsplash.com/photo-1689755340940-785b7c232d39"]'::jsonb,
    'active', TRUE, 690, 4.9, 267
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'Magnesium Glycinate 400mg',
    'magnesium-glycinate-400mg',
    'High-absorption magnesium supplement for sleep and muscle health.',
    'Magnesium glycinate 400mg per capsule for maximum absorption without digestive discomfort. Supports quality sleep, muscle relaxation, and nervous system health. 120 capsules per bottle.',
    'NC-MAG-001',
    'NutraCo',
    '10000000-0000-0000-0000-000000000003',
    ARRAY['magnesium', 'supplement', 'sleep', 'muscle'],
    22.99, NULL, 9.00, 0, 20,
    '["https://images.unsplash.com/photo-1694150001431-9fa9cc9c4c83"]'::jsonb,
    'active', FALSE, 330, 4.7, 315
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'Exfoliating Body Scrub 300g',
    'exfoliating-body-scrub-300g',
    'Gentle exfoliating body scrub with natural ingredients.',
    'Made with sugar crystals, coconut oil, and shea butter, this body scrub gently removes dead skin cells while nourishing and moisturizing. Reveals softer, smoother, more radiant skin.',
    'BL-EBS-001',
    'BodyLux',
    '10000000-0000-0000-0000-000000000004',
    ARRAY['body scrub', 'exfoliating', 'natural', 'body care'],
    18.99, 24.00, 8.00, 180, 25,
    '["https://images.unsplash.com/photo-1632127421044-d918b3268071"]'::jsonb,
    'active', FALSE, 290, 4.5, 142
  );

-- ============================================================
-- SAMPLE CUSTOMERS
-- ============================================================
INSERT INTO customers (id, name, email, phone, total_orders, total_spent, status) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Fatima Zahra', 'fatima@example.com', '+212-6XX-000001', 5, 1250.00, 'active'),
  ('30000000-0000-0000-0000-000000000002', 'Mohammed Ali', 'mohammed@example.com', '+212-6XX-000002', 3, 780.00, 'active'),
  ('30000000-0000-0000-0000-000000000003', 'Amina Benali', 'amina@example.com', '+212-6XX-000003', 8, 2100.00, 'active'),
  ('30000000-0000-0000-0000-000000000004', 'Youssef El Amrani', 'youssef@example.com', '+212-6XX-000004', 2, 450.00, 'active'),
  ('30000000-0000-0000-0000-000000000005', 'Sara Haddad', 'sara@example.com', '+212-6XX-000005', 1, 199.00, 'inactive');

-- ============================================================
-- SAMPLE ORDERS
-- ============================================================
INSERT INTO orders (id, order_number, customer_id, customer_name, customer_email, customer_phone, subtotal, discount, shipping_cost, total, payment_method, payment_status, order_status, shipping_address, billing_address) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'SDF-20260801-A1B2C3',
    '30000000-0000-0000-0000-000000000001',
    'Fatima Zahra',
    'fatima@example.com',
    '+212-6XX-000001',
    199.00, 0, 30.00, 229.00,
    'cash_on_delivery', 'pending', 'delivered',
    '{"name":"Fatima Zahra","address":"123 Rue Hassan II","city":"Casablanca","region":"Casablanca-Settat","phone":"+212-6XX-000001"}'::jsonb,
    '{"name":"Fatima Zahra","address":"123 Rue Hassan II","city":"Casablanca","region":"Casablanca-Settat"}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'SDF-20260805-D4E5F6',
    '30000000-0000-0000-0000-000000000002',
    'Mohammed Ali',
    'mohammed@example.com',
    '+212-6XX-000002',
    179.00, 0, 25.00, 204.00,
    'credit_card', 'paid', 'shipped',
    '{"name":"Mohammed Ali","address":"45 Avenue Mohammed V","city":"Rabat","region":"Rabat-Sale-Kenitra","phone":"+212-6XX-000002"}'::jsonb,
    '{"name":"Mohammed Ali","address":"45 Avenue Mohammed V","city":"Rabat","region":"Rabat-Sale-Kenitra"}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'SDF-20260808-G7H8I9',
    '30000000-0000-0000-0000-000000000003',
    'Amina Benali',
    'amina@example.com',
    '+212-6XX-000003',
    249.00, 20.00, 0, 229.00,
    'credit_card', 'paid', 'processing',
    '{"name":"Amina Benali","address":"78 Rue de la Liberte","city":"Marrakech","region":"Marrakech-Safi","phone":"+212-6XX-000003"}'::jsonb,
    '{"name":"Amina Benali","address":"78 Rue de la Liberte","city":"Marrakech","region":"Marrakech-Safi"}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'SDF-20260809-J0K1L2',
    NULL,
    'Guest User',
    'guest@example.com',
    '+212-6XX-999999',
    149.00, 0, 35.00, 184.00,
    'cash_on_delivery', 'pending', 'confirmed',
    '{"name":"Guest User","address":"12 Rue Tarik Ibn Ziad","city":"Tangier","region":"Tanger-Tetouan-Al Hoceima","phone":"+212-6XX-999999"}'::jsonb,
    '{"name":"Guest User","address":"12 Rue Tarik Ibn Ziad","city":"Tangier","region":"Tanger-Tetouan-Al Hoceima"}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    'SDF-20260810-M3N4O5',
    '30000000-0000-0000-0000-000000000004',
    'Youssef El Amrani',
    'youssef@example.com',
    '+212-6XX-000004',
    59.99, 0, 30.00, 89.99,
    'bank_transfer', 'pending', 'pending',
    '{"name":"Youssef El Amrani","address":"90 Boulevard Zerktouni","city":"Agadir","region":"Souss-Massa","phone":"+212-6XX-000004"}'::jsonb,
    '{"name":"Youssef El Amrani","address":"90 Boulevard Zerktouni","city":"Agadir","region":"Souss-Massa"}'::jsonb
  );

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total) VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Pure Argan Oil - Premium Grade', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', 1, 199.00, 199.00),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Hydra-Boost Vitamin C Serum', 'https://images.unsplash.com/photo-1730968856900-1d661cf77b74', 1, 179.00, 179.00),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 'Retinol Night Renewal Cream', 'https://images.unsplash.com/photo-1689755340940-785b7c232d39', 1, 249.00, 249.00),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'Microcurrent Facial Toning Device', 'https://cdn.shopify.com/s/files/1/0956/6208/0301/files/Create_ONE_high-end_fashion_collage_202606301753-ezgif.com-jpg-to-webp-converter.webp?v=1782835836', 1, 149.00, 149.00),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Whey Protein Isolate Vanilla 2lb', 'https://img.rocket.new/generatedImages/rocket_gen_img_13ea61377-1784992504314.png', 1, 59.99, 59.99);

-- ============================================================
-- ORDER TIMELINE
-- ============================================================
INSERT INTO order_timeline (order_id, status, timestamp, note) VALUES
  ('40000000-0000-0000-0000-000000000001', 'pending', '2026-08-01 10:00:00+00', 'Order placed'),
  ('40000000-0000-0000-0000-000000000001', 'confirmed', '2026-08-01 10:30:00+00', 'Payment confirmed'),
  ('40000000-0000-0000-0000-000000000001', 'processing', '2026-08-01 14:00:00+00', 'Order being prepared'),
  ('40000000-0000-0000-0000-000000000001', 'shipped', '2026-08-02 09:00:00+00', 'Shipped via Amana'),
  ('40000000-0000-0000-0000-000000000001', 'delivered', '2026-08-04 16:00:00+00', 'Delivered successfully'),
  ('40000000-0000-0000-0000-000000000002', 'pending', '2026-08-05 11:00:00+00', 'Order placed'),
  ('40000000-0000-0000-0000-000000000002', 'confirmed', '2026-08-05 11:30:00+00', 'Payment confirmed'),
  ('40000000-0000-0000-0000-000000000002', 'processing', '2026-08-05 15:00:00+00', 'Order being prepared'),
  ('40000000-0000-0000-0000-000000000002', 'shipped', '2026-08-06 08:00:00+00', 'Shipped via Amana'),
  ('40000000-0000-0000-0000-000000000003', 'pending', '2026-08-08 09:00:00+00', 'Order placed'),
  ('40000000-0000-0000-0000-000000000003', 'confirmed', '2026-08-08 09:15:00+00', 'Payment confirmed'),
  ('40000000-0000-0000-0000-000000000003', 'processing', '2026-08-08 13:00:00+00', 'Order being prepared'),
  ('40000000-0000-0000-0000-000000000004', 'pending', '2026-08-09 14:00:00+00', 'Order placed'),
  ('40000000-0000-0000-0000-000000000004', 'confirmed', '2026-08-09 14:30:00+00', 'Order confirmed'),
  ('40000000-0000-0000-0000-000000000005', 'pending', '2026-08-10 08:00:00+00', 'Order placed - awaiting confirmation');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (type, title, message, read, action_url) VALUES
  ('order', 'New Order #SDF-20260810-M3N4O5', 'Youssef El Amrani placed a new order for 89.99 MAD.', FALSE, '/dashboard/orders'),
  ('stock', 'Low Stock Alert', 'Magnesium Glycinate 400mg is out of stock.', FALSE, '/dashboard/inventory'),
  ('review', 'New Review', 'A customer left a 5-star review on Retinol Night Renewal Cream.', TRUE, '/dashboard/reviews'),
  ('payment', 'Payment Received', 'Payment of 204.00 MAD confirmed for order #SDF-20260805-D4E5F6.', TRUE, '/dashboard/orders'),
  ('customer', 'New Customer', 'Sara Haddad registered a new account.', TRUE, '/dashboard/customers');

-- ============================================================
-- SHIPPING ZONES
-- ============================================================
INSERT INTO shipping_zones (name, cities) VALUES
  ('Zone 1 - Major Cities', '["Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fez", "Meknes", "Oujda"]'::jsonb),
  ('Zone 2 - Other Cities', '["Kenitra", "Tetouan", "Safi", "El Jadida", "Nador", "Beni Mellal", "Khouribga", "Settat"]'::jsonb);

-- ============================================================
-- SHIPPING METHODS
-- ============================================================
INSERT INTO shipping_methods (zone_id, name, price, estimated_days, free_shipping_threshold) VALUES
  ((SELECT id FROM shipping_zones WHERE name = 'Zone 1 - Major Cities'), 'Standard', 25.00, '2-3 days', 500.00),
  ((SELECT id FROM shipping_zones WHERE name = 'Zone 1 - Major Cities'), 'Express', 45.00, '1 day', NULL),
  ((SELECT id FROM shipping_zones WHERE name = 'Zone 2 - Other Cities'), 'Standard', 35.00, '3-5 days', 500.00),
  ((SELECT id FROM shipping_zones WHERE name = 'Zone 2 - Other Cities'), 'Express', 60.00, '1-2 days', NULL);

-- ============================================================
-- SAMPLE REVIEWS
-- ============================================================
INSERT INTO reviews (customer_id, customer_name, product_id, product_name, rating, comment, status) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Fatima Zahra', '20000000-0000-0000-0000-000000000001', 'Hydra-Boost Vitamin C Serum', 5, 'Amazing serum! My skin is glowing after just 2 weeks of use.', 'approved'),
  ('30000000-0000-0000-0000-000000000002', 'Mohammed Ali', '20000000-0000-0000-0000-000000000006', 'Retinol Night Renewal Cream', 5, 'Best night cream I have ever used. Fine lines are visibly reduced.', 'approved'),
  ('30000000-0000-0000-0000-000000000003', 'Amina Benali', '20000000-0000-0000-0000-000000000004', 'Deep Repair Argan Body Oil', 4, 'Very moisturizing and smells great. Would buy again!', 'approved'),
  ('30000000-0000-0000-0000-000000000004', 'Youssef El Amrani', '20000000-0000-0000-0000-000000000005', 'Whey Protein Isolate Vanilla 2lb', 5, 'Great taste and mixes well. Excellent quality protein.', 'approved'),
  ('30000000-0000-0000-0000-000000000005', 'Sara Haddad', '20000000-0000-0000-0000-000000000003', 'Microcurrent Facial Toning Device', 4, 'Works well but takes some time to see results. Be patient!', 'pending');

-- ============================================================
-- SAMPLE COUPONS
-- ============================================================
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order, maximum_discount, start_date, end_date, usage_limit, status) VALUES
  ('WELCOME10', '10% off for new customers', 'percentage', 10, 100, 100, '2026-01-01', '2026-12-31', 500, 'active'),
  ('SUMMER25', 'Summer sale - 25% off', 'percentage', 25, 200, 200, '2026-06-01', '2026-09-30', 200, 'active'),
  ('FREESHIP', 'Free shipping on all orders', 'fixed', 35, 0, NULL, '2026-08-01', '2026-08-31', 100, 'active');