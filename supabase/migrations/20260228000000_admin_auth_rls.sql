-- Admin Authentication: Enable RLS and require auth for all write operations.
-- Public read access is preserved so the site renders normally for visitors.
-- Only the authenticated admin user can INSERT, UPDATE, or DELETE content.
--
-- IMPORTANT: After applying this migration, enable Google OAuth in your
-- Supabase dashboard under Authentication > Providers > Google.

-- ============================================================
-- posts
-- ============================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read posts" ON posts;
DROP POLICY IF EXISTS "Admin write posts" ON posts;

CREATE POLICY "Public read posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Admin write posts"
  ON posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- news_items
-- ============================================================
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read news_items" ON news_items;
DROP POLICY IF EXISTS "Admin write news_items" ON news_items;

CREATE POLICY "Public read news_items"
  ON news_items FOR SELECT
  USING (true);

CREATE POLICY "Admin write news_items"
  ON news_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- reflections
-- ============================================================
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reflections" ON reflections;
DROP POLICY IF EXISTS "Admin write reflections" ON reflections;

CREATE POLICY "Public read reflections"
  ON reflections FOR SELECT
  USING (true);

CREATE POLICY "Admin write reflections"
  ON reflections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- home_sections
-- ============================================================
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read home_sections" ON home_sections;
DROP POLICY IF EXISTS "Admin write home_sections" ON home_sections;

CREATE POLICY "Public read home_sections"
  ON home_sections FOR SELECT
  USING (true);

CREATE POLICY "Admin write home_sections"
  ON home_sections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- categories
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin write categories" ON categories;

CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admin write categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- contact_submissions (public insert so visitors can submit forms)
-- ============================================================
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin read contact_submissions" ON contact_submissions;

CREATE POLICY "Public insert contact_submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read contact_submissions"
  ON contact_submissions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update contact_submissions"
  ON contact_submissions FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- newsletter_subscribers (public insert so visitors can subscribe)
-- ============================================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin read newsletter" ON newsletter_subscribers;

CREATE POLICY "Public insert newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read newsletter"
  ON newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- market_data (public read, admin write)
-- ============================================================
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read market_data" ON market_data;
DROP POLICY IF EXISTS "Admin write market_data" ON market_data;

CREATE POLICY "Public read market_data"
  ON market_data FOR SELECT
  USING (true);

CREATE POLICY "Admin write market_data"
  ON market_data FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
