
-- 1. Add title column to home_sections (referenced by frontend code)
ALTER TABLE public.home_sections
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

-- 2. Replace overly-permissive write policy with authenticated-only
DROP POLICY IF EXISTS "Anyone can update home sections" ON public.home_sections;

CREATE POLICY "Authenticated users can manage home sections"
  ON public.home_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Lock down blog-images storage bucket: drop anon write policies if any exist,
--    and require authentication for writes. Public read is preserved.
DROP POLICY IF EXISTS "Public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete blog images" ON storage.objects;

-- Ensure auth-only write policies exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Authenticated users can upload blog images'
  ) THEN
    CREATE POLICY "Authenticated users can upload blog images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Authenticated users can update blog images'
  ) THEN
    CREATE POLICY "Authenticated users can update blog images"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Authenticated users can delete blog images'
  ) THEN
    CREATE POLICY "Authenticated users can delete blog images"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public can read blog images'
  ) THEN
    CREATE POLICY "Public can read blog images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'blog-images');
  END IF;
END $$;
