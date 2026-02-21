-- Add editable title column to home_sections
ALTER TABLE public.home_sections
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

-- Seed default titles for existing rows
UPDATE public.home_sections SET title = 'About Me'              WHERE section_key = 'about_me'            AND title = '';
UPDATE public.home_sections SET title = 'My Principles'         WHERE section_key = 'my_principles'       AND title = '';
UPDATE public.home_sections SET title = 'Reflections on AI'     WHERE section_key = 'reflections_on_ai'   AND title = '';
UPDATE public.home_sections SET title = 'Resume'                WHERE section_key = 'my_resume'           AND title = '';

-- Ensure RLS is enabled so policies are enforced
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they are correct
DROP POLICY IF EXISTS "Public can read home sections"    ON public.home_sections;
DROP POLICY IF EXISTS "Anyone can update home sections"  ON public.home_sections;

-- Public (anon) can read all sections
CREATE POLICY "Public can read home sections"
  ON public.home_sections
  FOR SELECT
  USING (true);

-- Anyone (anon + authenticated) can upsert sections (admin panel uses anon key)
CREATE POLICY "Anyone can upsert home sections"
  ON public.home_sections
  FOR ALL
  USING (true)
  WITH CHECK (true);
