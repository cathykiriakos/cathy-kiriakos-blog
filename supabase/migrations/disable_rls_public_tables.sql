-- Migration: Disable RLS for public data tables
-- Since market_data and news_items are public read data with only service role writes,
-- RLS adds no security benefit and only causes issues

-- ====================================
-- DISABLE RLS ON PUBLIC DATA TABLES
-- ====================================

-- Market Data - public information, no security concerns
ALTER TABLE market_data DISABLE ROW LEVEL SECURITY;

-- News Items - public information, no security concerns
ALTER TABLE news_items DISABLE ROW LEVEL SECURITY;

-- Posts table - keep RLS enabled but make policies permissive
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Enable insert for service role" ON posts;
DROP POLICY IF EXISTS "Enable update for service role" ON posts;
DROP POLICY IF EXISTS "Enable delete for service role" ON posts;

-- Allow public read for all posts
CREATE POLICY "Public read access"
ON posts
FOR SELECT
USING (true);

-- Allow all operations for authenticated users (includes service role)
CREATE POLICY "Authenticated full access"
ON posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure service role has explicit grants
GRANT ALL ON market_data TO service_role;
GRANT ALL ON news_items TO service_role;
GRANT ALL ON posts TO service_role;

-- Also grant to anon for read access
GRANT SELECT ON market_data TO anon;
GRANT SELECT ON news_items TO anon;
GRANT SELECT ON posts TO anon;
