-- Create categories table for dynamic post category management.
-- Categories store a name and an optional page slug indicating which
-- section of the site posts with that category appear on.

CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL UNIQUE,
  page       TEXT,        -- page slug: 'ni-data', 'personal-reflections', 'business-technology', etc.
                          -- NULL means the category appears on All Posts only
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_page ON public.categories (page);

-- Seed with the existing hardcoded categories so nothing breaks on first deploy
INSERT INTO public.categories (name, page) VALUES
  ('AI Innovation',        NULL),
  ('Culture',              NULL),
  ('Management',           NULL),
  ('Data Engineering',     NULL),
  ('NiData Journey',       'ni-data'),
  ('Personal Reflections', 'personal-reflections')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
