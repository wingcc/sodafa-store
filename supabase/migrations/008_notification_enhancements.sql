-- ============================================================
-- SODFA STORE - Notification Enhancements
-- Migration: 008_notification_enhancements
-- Description: Support new Notification Center UI (priority,
--              starred/bookmark, metadata, expanded types)
-- ============================================================

-- 1. Notification priority enum (new UI: low/medium/high/urgent)
DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Extend notification_type with values required by new UI.
--    Existing values: order, customer, stock, review, payment, system
--    New values: product, shipping, promotion, social, inventory, security
--    We keep legacy values for backward compatibility (stock<->inventory,
--    customer<->social are treated as aliases in the app layer).
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'product';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'shipping';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'promotion';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'social';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'inventory';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'security';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. New columns: priority, starred, metadata
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS priority notification_priority NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Backfill nulls if any row was inserted before the default (idempotent)
UPDATE notifications SET priority = 'medium' WHERE priority IS NULL;
UPDATE notifications SET starred = FALSE WHERE starred IS NULL;
UPDATE notifications SET metadata = '{}'::jsonb WHERE metadata IS NULL;

-- Ensure every row gets a reasonable priority if title hints urgency
UPDATE notifications SET priority = 'high'
  WHERE priority = 'medium' AND (title ILIKE '%alert%' OR title ILIKE '%out of stock%' OR type = 'payment');

-- 4. Indexes for new query patterns (filters + starred + priority)
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_starred ON notifications(starred) WHERE starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority);
CREATE INDEX IF NOT EXISTS idx_notifications_read_starred ON notifications(read, starred);
CREATE INDEX IF NOT EXISTS idx_notifications_metadata_gin ON notifications USING gin (metadata);

-- 5. Seed updated preferences keys for new types (optional, not required but keeps settings forward-compatible)
INSERT INTO store_settings (key, value) VALUES
  ('notify_product', 'true'),
  ('notify_shipping', 'true'),
  ('notify_promotion', 'true'),
  ('notify_social', 'true')
ON CONFLICT (key) DO NOTHING;

-- Commit new enum values so they are visible for seeding (fixes 55P04: unsafe use of new value)
COMMIT;

-- 6. Seed fake/example notifications (all 10 types + 4 priorities)
--    Idempotent: only inserts if fewer than 15 notifications exist
DO $$
DECLARE
  cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM notifications;
  IF cnt < 15 THEN
    INSERT INTO notifications (type, title, message, read, starred, priority, action_url, metadata, timestamp) VALUES
      -- Urgent order (unread, starred)
      ('order', 'New order received!', 'Customer Fatima Zahra placed order #SDF-2026-0847 for 3 items — 249.99 MAD. Ship within 24h.', false, true, 'urgent', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0847','amount',249.99,'items',3), NOW() - INTERVAL '2 hours'),
      -- High review (unread)
      ('review', 'New 5-star review', 'Sarah Johnson left a 5-star review for "Premium Wireless Headphones" — "Absolutely love it!"', false, false, 'high', '/dashboard/reviews', jsonb_build_object('productId','PROD-2024-001','productName','Premium Wireless Headphones','rating',5), NOW() - INTERVAL '5 hours'),
      -- Medium payment (read)
      ('payment', 'Payment confirmed', 'Payment of 89.99 MAD for order #SDF-2026-0846 has been confirmed via COD.', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0846','amount',89.99), NOW() - INTERVAL '1 day'),
      -- Medium shipping (unread, promotion-like)
      ('shipping', 'Package shipped', 'Order #SDF-2026-0846 has been shipped. Tracking: TRK-7890-1234-5678 via Express.', false, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0846','trackingNumber','TRK-7890-1234-5678'), NOW() - INTERVAL '2 days'),
      -- High promotion (unread, starred)
      ('promotion', 'Flash sale: 20% off accessories!', 'Limited time: 20% off all accessories for 24h. Use code FLASH20.', false, true, 'high', '/dashboard/coupons', jsonb_build_object('promotionCode','FLASH20','discount',20,'category','accessories'), NOW() - INTERVAL '3 hours'),
      -- Medium system (read)
      ('system', 'System maintenance scheduled', 'Scheduled maintenance Dec 15, 2024 02:00–04:00 UTC — expect 2h downtime.', true, false, 'medium', '/dashboard/settings', jsonb_build_object('maintenanceWindow','2024-12-15 02:00:00','duration','2 hours'), NOW() - INTERVAL '3 days'),
      -- Low social (unread)
      ('social', 'New follower alert', 'Jessica Martinez started following your store. Connect with your new follower!', false, false, 'low', '/dashboard/customers', jsonb_build_object('followerName','Jessica Martinez'), NOW() - INTERVAL '4 days'),
      -- High inventory (unread)
      ('inventory', 'Low stock warning', 'Product "Wireless Charging Pad" has only 5 units remaining. Restock soon.', false, false, 'high', '/dashboard/inventory', jsonb_build_object('productName','Wireless Charging Pad','currentStock',5,'reorderLevel',10), NOW() - INTERVAL '1 day'),
      -- Urgent security (unread, starred)
      ('security', 'New login detected', 'New login from Paris, France on iPhone 15 Pro — if this wasn''t you, change your password.', false, true, 'urgent', '/dashboard/settings', jsonb_build_object('location','Paris, France','device','iPhone 15 Pro'), NOW() - INTERVAL '1 hour'),
      -- Medium product restock (unread)
      ('product', 'Back in stock!', 'Product "Noise-Canceling Headphones" is back in stock — available in all colors.', false, false, 'medium', '/dashboard/products', jsonb_build_object('productName','Noise-Canceling Headphones','availableColors', jsonb_build_array('Black','White','Blue')), NOW() - INTERVAL '12 hours'),
      -- Low review reply (read)
      ('review', 'Review reply received', 'Admin replied to your review for "Smart Watch Pro". Check the response.', true, false, 'low', '/dashboard/reviews', jsonb_build_object('productName','Smart Watch Pro','reviewId','REV-2024-001'), NOW() - INTERVAL '2 days'),
      -- High order delivered (read)
      ('order', 'Order delivered successfully', 'Order #SDF-2026-0841 has been delivered. Thank you for shopping with us!', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0841'), NOW() - INTERVAL '6 hours'),
      -- Low system welcome (read, from 007 seed style)
      ('system', 'Welcome to SODFA Marketplace!', 'We''re excited to have you on board. Explore 100% natural Moroccan beauty & skincare.', true, false, 'low', '/dashboard', jsonb_build_object('welcome', true), NOW() - INTERVAL '7 days'),
      -- Urgent inventory out of stock (unread)
      ('inventory', 'Out of stock — urgent', 'Volumizing Mascara - Black (Brown variant) is out of stock. 0 units.', false, false, 'urgent', '/dashboard/inventory', jsonb_build_object('productName','Volumizing Mascara - Black','currentStock',0), NOW() - INTERVAL '30 minutes'),
      -- High payment pending (unread)
      ('payment', '3 orders have pending COD payments', '3 orders have pending Cash on Delivery payments — total 412.50 MAD.', false, false, 'high', '/dashboard/payments', jsonb_build_object('pendingOrders',3,'totalPending',412.50), NOW() - INTERVAL '8 hours'),
      -- Medium social customer (read, legacy type still valid)
      ('customer', 'New Customer — Hajar Amrani', 'Hajar Amrani registered on SODFA MARKETPLACE — welcome her!', true, false, 'medium', '/dashboard/customers', jsonb_build_object('customerName','Hajar Amrani'), NOW() - INTERVAL '5 days'),
      -- High stock legacy (unread, legacy type)
      ('stock', 'Low Stock Alert — Glossy Lipstick', 'Glossy Lipstick - Rose Gold has only 8 units remaining.', false, false, 'high', '/dashboard/inventory', jsonb_build_object('productName','Glossy Lipstick - Rose Gold','currentStock',8), NOW() - INTERVAL '9 hours'),
      -- Medium shipping promotion (read)
      ('shipping', 'Delivery delayed — weather', 'Your delivery for order #SDF-2026-0842 has been delayed due to weather conditions.', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0842','reason','weather'), NOW() - INTERVAL '1 day 3 hours'),
      -- Low product new arrival (unread)
      ('product', 'New arrival: Argan Hair Serum', 'New product "Argan Hair Serum — 100% Natural" is now available in store.', false, false, 'low', '/dashboard/products', jsonb_build_object('productName','Argan Hair Serum'), NOW() - INTERVAL '6 days'),
      -- High security — from previous examples
      ('security', 'Security check — 2FA enabled', 'Two-factor authentication was enabled for your admin account.', true, true, 'high', '/dashboard/settings', jsonb_build_object('action','2FA enabled'), NOW() - INTERVAL '2 days 4 hours'),
      -- Urgent promotion ending (unread)
      ('promotion', 'Promotion ending soon', 'Your "WELCOME20" coupon expires in 3 hours — 124 uses remaining.', false, false, 'urgent', '/dashboard/coupons', jsonb_build_object('code','WELCOME20','usesLeft',124), NOW() - INTERVAL '45 minutes'),
      -- Medium order cancelled (read)
      ('order', 'Order cancelled by customer', 'Order #SDF-2026-0843 was cancelled by Nadia Chraibi — refund initiated.', true, false, 'medium', '/dashboard/orders', jsonb_build_object('orderId','SDF-2026-0843','customerName','Nadia Chraibi'), NOW() - INTERVAL '10 days'),
      -- Low customer message (unread)
      ('customer', 'Customer message — Fatima', 'Fatima Zahra sent a message: "When will my order arrive?"', false, false, 'low', '/dashboard/customers', jsonb_build_object('customerName','Fatima Zahra'), NOW() - INTERVAL '15 hours'),
      -- High review 3-star (unread)
      ('review', 'New 3-star review — needs attention', 'Yasmine Toumi left a 3-star review on "Volumizing Mascara" — check feedback.', false, false, 'high', '/dashboard/reviews', jsonb_build_object('productName','Volumizing Mascara','rating',3), NOW() - INTERVAL '18 hours')
    ;
  END IF;
END $$;
