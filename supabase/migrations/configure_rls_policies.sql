-- Migration: Configure Row Level Security Policies
-- This allows the frontend to read data and GitHub Actions to write data

-- ====================================
-- MARKET DATA TABLE
-- ====================================

-- Enable RLS on market_data table (if not already enabled)
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to market data" ON market_data;
DROP POLICY IF EXISTS "Allow service role to insert market data" ON market_data;
DROP POLICY IF EXISTS "Allow service role to update market data" ON market_data;
DROP POLICY IF EXISTS "Allow service role to delete market data" ON market_data;

-- Allow anyone to READ market data (for frontend display)
CREATE POLICY "Allow public read access to market data"
ON market_data
FOR SELECT
TO public
USING (true);

-- Allow service role to INSERT data (for GitHub Actions)
CREATE POLICY "Allow service role to insert market data"
ON market_data
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to UPDATE data (for GitHub Actions)
CREATE POLICY "Allow service role to update market data"
ON market_data
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to DELETE data (for cleanup)
CREATE POLICY "Allow service role to delete market data"
ON market_data
FOR DELETE
TO service_role
USING (true);


-- ====================================
-- NEWS ITEMS TABLE
-- ====================================

-- Enable RLS on news_items table
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to news items" ON news_items;
DROP POLICY IF EXISTS "Allow service role to insert news items" ON news_items;
DROP POLICY IF EXISTS "Allow service role to update news items" ON news_items;
DROP POLICY IF EXISTS "Allow service role to delete news items" ON news_items;

-- Allow anyone to READ news items (for frontend display)
CREATE POLICY "Allow public read access to news items"
ON news_items
FOR SELECT
TO public
USING (true);

-- Allow service role to INSERT data (for GitHub Actions)
CREATE POLICY "Allow service role to insert news items"
ON news_items
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to UPDATE data (for GitHub Actions)
CREATE POLICY "Allow service role to update news items"
ON news_items
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to DELETE data (for cleanup)
CREATE POLICY "Allow service role to delete news items"
ON news_items
FOR DELETE
TO service_role
USING (true);
