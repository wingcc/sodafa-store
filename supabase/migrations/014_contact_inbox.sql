-- ============================================================
-- SODFA STORE - Unified Contact Inbox
-- Migration: 014_contact_inbox
-- Replaces: 014_contact_messages.sql + 015_upgrade_contact_submissions.sql
-- Description: Single script that works on Supabase SQL Editor
--   - Creates contact_messages for new installs
--   - Upgrades legacy contact_submissions for existing installs
--   - Adds inbox features: status, starred, customer link
--   - Idempotent: safe to run multiple times
--   - Fixes gin_trgm_ops: extension is enabled BEFORE index
-- ============================================================

-- ── 0. Extensions (must be first, before any GIN index) ───────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── 1. New table: contact_messages (for new projects) ──────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  is_customer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Upgrade legacy table: contact_submissions ──────────────
--    Adds the same inbox columns if the table already exists.
--    Uses information_schema checks so it never errors on new installs
--    where contact_submissions may not exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_submissions') THEN

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='customer_id') THEN
      ALTER TABLE contact_submissions ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='status') THEN
      ALTER TABLE contact_submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','archived'));
      -- Backfill status from legacy `read` boolean
      -- Use dynamic SQL to avoid error if `read` column was renamed
      BEGIN
        EXECUTE 'UPDATE contact_submissions SET status = CASE WHEN read = true THEN ''read'' ELSE ''new'' END WHERE status = ''new''';
      EXCEPTION WHEN undefined_column THEN
        NULL;
      END;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='is_starred') THEN
      ALTER TABLE contact_submissions ADD COLUMN is_starred BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='is_customer') THEN
      ALTER TABLE contact_submissions ADD COLUMN is_customer BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='updated_at') THEN
      ALTER TABLE contact_submissions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;

  END IF;
END
$$;

-- ── 3. Indexes for contact_messages ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_starred ON contact_messages(is_starred) WHERE is_starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_customer_id ON contact_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_phone ON contact_messages(phone);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_name ON contact_messages(name);

-- Trigram search index: now safe because pg_trgm is already enabled.
-- Wrapped in DO block so it shows NOTICE instead of ERROR if anything is wrong.
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_contact_messages_search_trgm
    ON contact_messages USING gin ((name || ' ' || COALESCE(phone,'') || ' ' || COALESCE(email,'') || ' ' || message) gin_trgm_ops);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'idx_contact_messages_search_trgm not created (pg_trgm issue): %', SQLERRM;
END
$$;

-- ── 4. Indexes for contact_submissions (only if table exists) ─
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_submissions') THEN
    -- Use EXECUTE to allow IF NOT EXISTS without parser complaining about missing table at plan time
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_customer_id ON contact_submissions(customer_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_phone ON contact_submissions(phone)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_name ON contact_submissions(name)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_starred ON contact_submissions(is_starred) WHERE is_starred = TRUE';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC)';
    -- Optional trigram for legacy table as well
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contact_submissions_search_trgm ON contact_submissions USING gin ((name || '' '' || COALESCE(phone,'''') || '' '' || COALESCE(email,'''') || '' '' || message) gin_trgm_ops)';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'idx_contact_submissions_search_trgm not created: %', SQLERRM;
    END;
  END IF;
END
$$;

-- ── 5. Updated_at triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trigger_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_contact_messages_updated_at();

CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_submissions') THEN
    DROP TRIGGER IF EXISTS trigger_contact_submissions_updated_at ON contact_submissions;
    CREATE TRIGGER trigger_contact_submissions_updated_at
      BEFORE UPDATE ON contact_submissions
      FOR EACH ROW EXECUTE FUNCTION update_contact_submissions_updated_at();
  END IF;
END
$$;

-- ── 6. RLS ────────────────────────────────────────────────────
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all for authenticated users - contact_messages"
    ON contact_messages FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read for anon - contact_messages"
    ON contact_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure legacy table also has RLS (if it exists, it likely already does)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_submissions') THEN
    EXECUTE 'ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY';
    BEGIN
      EXECUTE 'CREATE POLICY "Allow all for authenticated users - contact_submissions" ON contact_submissions FOR ALL USING (true) WITH CHECK (true)';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE 'CREATE POLICY "Allow read for anon - contact_submissions" ON contact_submissions FOR SELECT USING (true)';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;

-- ── 7. Backfill is_customer (best-effort) ─────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_submissions')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='is_customer') THEN
    EXECUTE '
      UPDATE contact_submissions cs
      SET is_customer = true
      WHERE EXISTS (
        SELECT 1 FROM customers c
        WHERE (c.phone IS NOT NULL AND c.phone = cs.phone)
           OR (c.email IS NOT NULL AND LOWER(c.email) = LOWER(cs.email))
      )
      AND cs.is_customer = false
    ';
  END IF;

  -- Same backfill for contact_messages (in case data was inserted before)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_messages') THEN
    EXECUTE '
      UPDATE contact_messages cm
      SET is_customer = true
      WHERE EXISTS (
        SELECT 1 FROM customers c
        WHERE (c.phone IS NOT NULL AND c.phone = cm.phone)
           OR (c.email IS NOT NULL AND LOWER(c.email) = LOWER(cm.email))
      )
      AND cm.is_customer = false
    ';
  END IF;
END
$$;

-- ── 8. Seed demo messages (only if BOTH tables empty) ─────────
DO $$
DECLARE cnt_msgs int := 0;
DECLARE cnt_sub int := 0;
BEGIN
  SELECT COUNT(*) INTO cnt_msgs FROM contact_messages;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_submissions') THEN
    EXECUTE 'SELECT COUNT(*) FROM contact_submissions' INTO cnt_sub;
  END IF;

  IF cnt_msgs = 0 AND cnt_sub = 0 THEN
    INSERT INTO contact_messages (name, phone, email, message, status, is_starred, is_customer) VALUES
      ('Fatima Zahra', '+212 6 12 34 56 78', 'fatima@example.com', 'السلام، أريد الاستفسار عن سيروم الشعر وطريقة الاستعمال. هل هو مناسب للشعر الجاف؟', 'new', true, false),
      ('Salma Aloui', '+212 6 98 76 54 32', 'salma.aloui@gmail.com', 'Bonjour, je souhaite savoir si vous livrez à Marrakech et quel est le délai ? Merci !', 'new', false, true),
      ('Nour El Houda', '+212 6 55 44 33 22', NULL, 'أريد طلب سيروم الأرغان. هل الدفع عند الاستلام متاح؟', 'read', false, false),
      ('Yasmine Toumi', '+212 7 11 22 33 44', 'yasmine.t@gmail.com', 'Hello, I love your products! Do you have a discount for first order?', 'replied', false, true),
      ('Hajar Amrani', '+212 6 33 22 11 00', 'hajar.amrani@example.com', 'هل المنتج طبيعي 100٪؟ وهل يوجد شهادة؟', 'archived', true, true);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Seed skipped: %', SQLERRM;
END
$$;
