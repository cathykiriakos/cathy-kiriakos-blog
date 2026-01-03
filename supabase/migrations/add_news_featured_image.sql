-- Migration: Add featured and image_url to news_items table
-- This allows news items to be featured on the Market Intelligence page
-- and to display images alongside headlines

-- Add image_url column for news item images
ALTER TABLE public.news_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add featured column to mark top news items
ALTER TABLE public.news_items
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for faster featured news queries
CREATE INDEX IF NOT EXISTS idx_news_items_featured ON public.news_items(featured, published_date DESC);

-- Comment on columns
COMMENT ON COLUMN public.news_items.image_url IS 'URL to the news item image for display';
COMMENT ON COLUMN public.news_items.featured IS 'Whether this news item is featured on the Market Intelligence page';
