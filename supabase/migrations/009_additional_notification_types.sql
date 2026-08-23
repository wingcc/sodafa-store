-- ============================================================
-- SODFA STORE - Additional Notification Types (20 total)
-- Migration: 009_additional_notification_types
-- Description: Expand to 20 types per Notification Types & Constants spec
--   Adds: account, message, achievement, reminder, subscription,
--         support, analytics, team, event, custom
--   Keeps legacy customer/stock as aliases
-- ============================================================

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'account';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'message';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'achievement';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'reminder';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'subscription';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'analytics';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'team';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'event';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'custom';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed preferences for the 10 new types
INSERT INTO store_settings (key, value) VALUES
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

-- Commit new enum values so they are visible for seeding (fixes 55P04)
COMMIT;

-- Seed one example per new type (idempotent)
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
