
CREATE TABLE public.home_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

-- Allow public reads so the homepage can show the content
CREATE POLICY "Public can read home sections"
  ON public.home_sections
  FOR SELECT
  USING (true);

-- Allow all writes (admin-only page, no auth system in place)
CREATE POLICY "Anyone can update home sections"
  ON public.home_sections
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed the four default sections
INSERT INTO public.home_sections (section_key, content) VALUES
  ('about_me', 'Write something about yourself here...'),
  ('my_principles', 'Describe your core principles here...'),
  ('reflections_on_ai', 'Share your thoughts on AI here...'),
  ('my_resume', 'Paste your resume content here...');
