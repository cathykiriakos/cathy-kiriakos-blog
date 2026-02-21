-- Consolidated migration: ensure reflections and categories tables exist
-- with all columns added in prior migrations.
-- Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS so it is fully idempotent.

-- ============================================================
-- REFLECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reflections (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL,
  thought    TEXT,
  image_url  TEXT,
  video_url  TEXT,
  published  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add video_url in case table already existed without it
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS video_url TEXT;

CREATE INDEX IF NOT EXISTS idx_reflections_published
  ON public.reflections (published, created_at DESC);

ALTER TABLE public.reflections DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.reflections TO anon;
GRANT ALL ON public.reflections TO authenticated;
GRANT ALL ON public.reflections TO service_role;

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL UNIQUE,
  page       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_page ON public.categories (page);

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
