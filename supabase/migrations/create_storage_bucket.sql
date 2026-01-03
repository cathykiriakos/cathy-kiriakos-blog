-- Migration: Create storage bucket for blog images
-- This sets up Supabase Storage for uploading blog post images

-- ====================================
-- STORAGE BUCKET FOR BLOG IMAGES
-- ====================================

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users (admins) to update images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users (admins) to delete images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );
