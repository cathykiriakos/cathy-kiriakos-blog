-- Migration: Create all missing application tables
--
-- Root cause: only home_sections existed in the database.
-- The previous migration files (create_all_tables.sql, add_news_featured_image.sql,
-- add_unique_constraints.sql, fix_posts_rls.sql, etc.) all had descriptive-only names
-- so the Supabase CLI never applied them. This file consolidates everything they
-- intended to do into a single properly-timestamped migration.
--
-- Tables created here:
--   posts, news_items, market_data, private_valuations,
--   newsletter_subscribers, contact_submissions

-- ============================================================
-- POSTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  category    TEXT,
  excerpt     TEXT,
  content     TEXT,
  author      TEXT,
  image_url   TEXT,
  published   BOOLEAN     NOT NULL DEFAULT false,
  featured    BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug      ON public.posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts (published);
CREATE INDEX IF NOT EXISTS idx_posts_featured  ON public.posts (featured);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON public.posts (category);

-- Single-author blog: RLS disabled so the anon key can read/write from the admin panel
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

-- ============================================================
-- NEWS ITEMS
-- (includes image_url + featured from add_news_featured_image.sql
--  and the unique constraint from add_unique_constraints.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.news_items (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT        NOT NULL,
  source         TEXT,
  summary        TEXT,
  url            TEXT,
  image_url      TEXT,
  sentiment      TEXT        CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  featured       BOOLEAN     NOT NULL DEFAULT false,
  published_date DATE        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT news_items_title_date_unique UNIQUE (title, published_date)
);

CREATE INDEX IF NOT EXISTS idx_news_items_date      ON public.news_items (published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_sentiment ON public.news_items (sentiment);
CREATE INDEX IF NOT EXISTS idx_news_items_featured  ON public.news_items (featured, published_date DESC);

ALTER TABLE public.news_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.news_items TO anon;
GRANT ALL ON public.news_items TO authenticated;
GRANT ALL ON public.news_items TO service_role;

-- ============================================================
-- MARKET DATA
-- (includes unique constraint from add_unique_constraints.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.market_data (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name   TEXT        NOT NULL,
  ticker         TEXT        NOT NULL,
  company_type   TEXT        NOT NULL, -- 'ai', 'chip', 'infrastructure'
  market_cap     NUMERIC,
  price          NUMERIC,
  change_percent NUMERIC,
  volume         BIGINT,
  data_date      DATE        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT market_data_ticker_date_unique UNIQUE (ticker, data_date)
);

CREATE INDEX IF NOT EXISTS idx_market_data_date         ON public.market_data (data_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_ticker       ON public.market_data (ticker);
CREATE INDEX IF NOT EXISTS idx_market_data_company_type ON public.market_data (company_type);

ALTER TABLE public.market_data DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.market_data TO anon;
GRANT ALL ON public.market_data TO authenticated;
GRANT ALL ON public.market_data TO service_role;

-- ============================================================
-- PRIVATE VALUATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.private_valuations (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT        NOT NULL,
  company_type TEXT,
  valuation    TEXT,
  last_update  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.private_valuations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.private_valuations TO anon;
GRANT ALL ON public.private_valuations TO authenticated;
GRANT ALL ON public.private_valuations TO service_role;

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email           TEXT        NOT NULL UNIQUE,
  subscribed      BOOLEAN     NOT NULL DEFAULT true,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'unread'
               CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
