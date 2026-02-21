-- Add video_url column to reflections table so each reflection item
-- can optionally embed a YouTube, Vimeo, or direct video alongside text.

ALTER TABLE public.reflections
  ADD COLUMN IF NOT EXISTS video_url TEXT;
