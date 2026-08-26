-- ============================================================
-- SODFA STORE - Visitor Analytics & Tracking
-- Migration: 013_visitor_analytics
-- Description: Tables for tracking visitors, sessions, page views,
--              and events. Powers the Dashboard & Analytics pages.
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet', 'other');
CREATE TYPE visitor_type AS ENUM ('new', 'returning');
CREATE TYPE event_type AS ENUM (
  'page_view',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'purchase',
  'search',
  'scroll',
  'click',
  'wishlist_add',
  'wishlist_remove',
  'coupon_apply',
  'product_view',
  'category_view'
);

-- ============================================================
-- VISITORS — unique visitors identified by fingerprint
-- ============================================================
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint VARCHAR(64) NOT NULL UNIQUE,       -- browser fingerprint hash
  visitor_type visitor_type DEFAULT 'new',
  country VARCHAR(100) DEFAULT NULL,              -- from IP geolocation
  city VARCHAR(100) DEFAULT NULL,
  region VARCHAR(100) DEFAULT NULL,
  language VARCHAR(10) DEFAULT NULL,              -- browser language
  consent_analytics BOOLEAN DEFAULT FALSE,        -- cookie consent
  consent_marketing BOOLEAN DEFAULT FALSE,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  page_views_count INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visitors_fingerprint ON visitors(fingerprint);
CREATE INDEX idx_visitors_country ON visitors(country);
CREATE INDEX idx_visitors_last_seen ON visitors(last_seen_at DESC);
CREATE INDEX idx_visitors_consent ON visitors(consent_analytics) WHERE consent_analytics = TRUE;

-- ============================================================
-- SESSIONS — a single visit session
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  session_token VARCHAR(64) NOT NULL UNIQUE,      -- unique session identifier
  device device_type DEFAULT 'other',
  device_brand VARCHAR(100) DEFAULT NULL,         -- iPhone, Samsung, etc.
  browser VARCHAR(100) DEFAULT NULL,              -- Chrome, Safari, etc.
  browser_version VARCHAR(50) DEFAULT NULL,
  os VARCHAR(100) DEFAULT NULL,                   -- Windows, macOS, iOS, Android
  os_version VARCHAR(50) DEFAULT NULL,
  screen_width INTEGER DEFAULT NULL,
  screen_height INTEGER DEFAULT NULL,
  referrer_url TEXT DEFAULT NULL,                 -- where they came from
  referrer_domain VARCHAR(255) DEFAULT NULL,      -- extracted domain
  utm_source VARCHAR(100) DEFAULT NULL,
  utm_medium VARCHAR(100) DEFAULT NULL,
  utm_campaign VARCHAR(100) DEFAULT NULL,
  landing_page VARCHAR(500) DEFAULT NULL,         -- first page of session
  exit_page VARCHAR(500) DEFAULT NULL,            -- last page of session
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ DEFAULT NULL,
  duration_seconds INTEGER DEFAULT NULL,          -- computed on session end
  is_bounce BOOLEAN DEFAULT TRUE,                 -- single page view = bounce
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_visitor ON sessions(visitor_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_sessions_device ON sessions(device);
CREATE INDEX idx_sessions_referrer ON sessions(referrer_domain);
CREATE INDEX idx_sessions_utm ON sessions(utm_source, utm_medium, utm_campaign);

-- ============================================================
-- PAGE VIEWS — individual page loads
-- ============================================================
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_path VARCHAR(500) NOT NULL,               -- clean path without domain
  page_title VARCHAR(255) DEFAULT NULL,
  page_type VARCHAR(50) DEFAULT 'other',         -- home, store, product, category, checkout, etc.
  product_id UUID DEFAULT NULL,                   -- if product page
  category_id UUID DEFAULT NULL,                  -- if category page
  referrer TEXT DEFAULT NULL,
  time_on_page INTEGER DEFAULT NULL,             -- seconds spent (computed on next page_view or session end)
  scroll_depth SMALLINT DEFAULT NULL,            -- max scroll percentage (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_type ON page_views(page_type);
CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_page_views_product ON page_views(product_id) WHERE product_id IS NOT NULL;

-- ============================================================
-- VISITOR EVENTS — custom tracked events
-- ============================================================
CREATE TABLE visitor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  page_view_id UUID REFERENCES page_views(id) ON DELETE SET NULL,
  event_type event_type NOT NULL,
  event_name VARCHAR(100) DEFAULT NULL,           -- custom event name
  event_data JSONB DEFAULT NULL,                  -- flexible payload (product_id, value, etc.)
  page_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_session ON visitor_events(session_id);
CREATE INDEX idx_events_visitor ON visitor_events(visitor_id);
CREATE INDEX idx_events_type ON visitor_events(event_type);
CREATE INDEX idx_events_created ON visitor_events(created_at DESC);
CREATE INDEX idx_events_product ON visitor_events((event_data->>'product_id')) WHERE event_data ? 'product_id';

-- ============================================================
-- MATERIALIZED VIEW — daily aggregation for fast dashboard queries
-- ============================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_analytics AS
SELECT
  DATE(created_at) AS date,
  COUNT(DISTINCT visitor_id) AS unique_visitors,
  COUNT(*) AS page_views,
  COUNT(DISTINCT session_id) AS sessions
FROM page_views
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_date ON mv_daily_analytics(date);

-- ============================================================
-- FUNCTION — refresh daily analytics (call via cron or on-demand)
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_analytics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION — compute session duration and bounce on page_view insert
-- ============================================================
CREATE OR REPLACE FUNCTION update_session_on_page_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session page count and exit page
  UPDATE sessions
  SET
    page_views = page_views + 1,
    exit_page = NEW.page_path,
    is_bounce = FALSE
  WHERE id = NEW.session_id AND page_views > 0;

  -- Update visitor stats
  UPDATE visitors
  SET
    last_seen_at = NEW.created_at,
    page_views_count = page_views_count + 1
  WHERE id = NEW.visitor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_on_page_view
  AFTER INSERT ON page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_page_view();

-- ============================================================
-- FUNCTION — compute session duration on session end
-- ============================================================
CREATE OR REPLACE FUNCTION update_session_on_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_on_end
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
  EXECUTE FUNCTION update_session_on_end();

-- ============================================================
-- RLS — disabled for admin-only access via service role
-- ============================================================
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, but just in case:
CREATE POLICY "Admin full access" ON visitors FOR ALL USING (TRUE);
CREATE POLICY "Admin full access" ON sessions FOR ALL USING (TRUE);
CREATE POLICY "Admin full access" ON page_views FOR ALL USING (TRUE);
CREATE POLICY "Admin full access" ON visitor_events FOR ALL USING (TRUE);
