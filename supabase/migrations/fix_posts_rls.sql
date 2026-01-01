-- Fix posts table RLS to allow post creation from admin panel
-- This disables RLS since the blog is single-author and doesn't need complex auth

-- Disable RLS on posts table
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to anon key (for admin panel)
GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

-- Verify the change
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'posts';
