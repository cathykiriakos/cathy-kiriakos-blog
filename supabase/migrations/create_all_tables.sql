-- Migration: Create all required tables for Market Intelligence
-- This sets up the complete database schema

-- ====================================
-- MARKET DATA TABLE
-- ====================================

CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  company_type TEXT NOT NULL, -- 'ai', 'chip', or 'infrastructure'
  market_cap NUMERIC, -- in billions
  price NUMERIC,
  change_percent NUMERIC,
  volume BIGINT,
  data_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per ticker per date
  CONSTRAINT market_data_ticker_date_unique UNIQUE (ticker, data_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_data_date ON public.market_data(data_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_ticker ON public.market_data(ticker);
CREATE INDEX IF NOT EXISTS idx_market_data_company_type ON public.market_data(company_type);

-- Disable RLS (public data, no security needed)
ALTER TABLE public.market_data DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.market_data TO service_role;
GRANT SELECT ON public.market_data TO anon;
GRANT SELECT ON public.market_data TO authenticated;


-- ====================================
-- NEWS ITEMS TABLE
-- ====================================

CREATE TABLE IF NOT EXISTS public.news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  source TEXT,
  summary TEXT,
  sentiment TEXT, -- 'positive', 'neutral', 'negative'
  published_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one article per title per published date
  CONSTRAINT news_items_title_date_unique UNIQUE (title, published_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_items_date ON public.news_items(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_sentiment ON public.news_items(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_items_source ON public.news_items(source);

-- Disable RLS (public data, no security needed)
ALTER TABLE public.news_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.news_items TO service_role;
GRANT SELECT ON public.news_items TO anon;
GRANT SELECT ON public.news_items TO authenticated;


-- ====================================
-- POSTS TABLE (if it doesn't exist)
-- ====================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT,
  author TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);

-- Enable RLS for posts (user content)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON public.posts;
DROP POLICY IF EXISTS "Authenticated full access" ON public.posts;

-- Allow public read for all posts
CREATE POLICY "Public read access"
ON public.posts
FOR SELECT
USING (true);

-- Allow authenticated users full access
CREATE POLICY "Authenticated full access"
ON public.posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.posts TO service_role;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;


-- ====================================
-- VERIFY TABLES
-- ====================================

-- This will show you all tables created
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('market_data', 'news_items', 'posts')
ORDER BY tablename;
