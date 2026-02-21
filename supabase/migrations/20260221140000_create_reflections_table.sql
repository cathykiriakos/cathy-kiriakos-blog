-- Create reflections table for Personal Reflections page items
-- Each row is a single thought/image/headline card displayed on the Personal Reflections page.

CREATE TABLE IF NOT EXISTS public.reflections (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL,
  thought    TEXT,
  image_url  TEXT,
  published  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reflections_published ON public.reflections (published, created_at DESC);

-- Single-author blog: RLS disabled so the anon key can read/write from the admin panel
ALTER TABLE public.reflections DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.reflections TO anon;
GRANT ALL ON public.reflections TO authenticated;
GRANT ALL ON public.reflections TO service_role;
