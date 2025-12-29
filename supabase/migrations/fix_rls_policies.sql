-- Migration: Fix Row Level Security Policies for GitHub Actions
-- This ensures service role can write data while public can read

-- ====================================
-- MARKET DATA TABLE
-- ====================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access to market data" ON market_data;
DROP POLICY IF EXISTS "Allow service role to insert market data" ON market_data;
DROP POLICY IF EXISTS "Allow service role to update market data" ON market_data;
DROP POLICY IF EXISTS "Allow service role to delete market data" ON market_data;
DROP POLICY IF EXISTS "Enable read access for all users" ON market_data;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON market_data;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON market_data;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON market_data;

-- Enable RLS
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for frontend)
CREATE POLICY "Enable read access for all users"
ON market_data
FOR SELECT
USING (true);

-- Allow authenticated inserts (service role is authenticated)
CREATE POLICY "Enable insert for service role"
ON market_data
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated updates (service role is authenticated)
CREATE POLICY "Enable update for service role"
ON market_data
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated deletes (service role is authenticated)
CREATE POLICY "Enable delete for service role"
ON market_data
FOR DELETE
TO authenticated
USING (true);


-- ====================================
-- NEWS ITEMS TABLE
-- ====================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to news items" ON news_items;
DROP POLICY IF EXISTS "Allow service role to insert news items" ON news_items;
DROP POLICY IF EXISTS "Allow service role to update news items" ON news_items;
DROP POLICY IF EXISTS "Allow service role to delete news items" ON news_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON news_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON news_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON news_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON news_items;

-- Enable RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for frontend)
CREATE POLICY "Enable read access for all users"
ON news_items
FOR SELECT
USING (true);

-- Allow authenticated inserts (service role is authenticated)
CREATE POLICY "Enable insert for service role"
ON news_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated updates (service role is authenticated)
CREATE POLICY "Enable update for service role"
ON news_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated deletes (service role is authenticated)
CREATE POLICY "Enable delete for service role"
ON news_items
FOR DELETE
TO authenticated
USING (true);


-- ====================================
-- POSTS TABLE (for daily digests)
-- ====================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Enable insert for service role" ON posts;
DROP POLICY IF EXISTS "Enable update for service role" ON posts;
DROP POLICY IF EXISTS "Enable delete for service role" ON posts;

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published posts
CREATE POLICY "Enable read access for all users"
ON posts
FOR SELECT
USING (true);

-- Allow authenticated inserts (service role is authenticated)
CREATE POLICY "Enable insert for service role"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated updates (service role is authenticated)
CREATE POLICY "Enable update for service role"
ON posts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated deletes (service role is authenticated)
CREATE POLICY "Enable delete for service role"
ON posts
FOR DELETE
TO authenticated
USING (true);

-- Grant explicit permissions to service role (bypass RLS)
GRANT ALL ON market_data TO service_role;
GRANT ALL ON news_items TO service_role;
GRANT ALL ON posts TO service_role;
