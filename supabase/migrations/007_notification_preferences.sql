-- ============================================================
-- SODFA STORE - Notification Preferences & Settings
-- Migration: 007_notification_preferences
-- Description: Add notification preference settings and seed defaults
-- ============================================================

-- Insert default notification preferences into store_settings
INSERT INTO store_settings (key, value) VALUES
  ('notify_new_orders', 'true'),
  ('notify_low_stock', 'true'),
  ('notify_new_reviews', 'true'),
  ('notify_payments', 'true'),
  ('notify_daily_reports', 'true'),
  ('notify_system_errors', 'true'),
  ('notify_security_events', 'true'),
  ('notify_new_customers', 'true')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_type_read ON notifications(type, read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp_desc ON notifications(timestamp DESC);

-- Add RLS policy for notifications (admin access already exists in 001_initial_schema)
-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;