-- Create media_content table for videos and podcasts
CREATE TABLE IF NOT EXISTS media_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'podcast', 'audio')),

  -- Media hosting options
  hosting_type TEXT CHECK (hosting_type IN ('youtube', 'vimeo', 'spotify', 'soundcloud', 'self-hosted')),
  embed_url TEXT, -- Embed URL for third-party platforms
  media_url TEXT, -- Direct URL for self-hosted media

  -- Metadata
  duration INTEGER, -- Duration in seconds
  thumbnail_url TEXT,
  transcript TEXT, -- Full transcript for accessibility
  show_notes TEXT, -- Podcast show notes / video description

  -- Organization
  category TEXT,
  tags TEXT[],
  season INTEGER, -- For podcast series
  episode_number INTEGER,

  -- Publishing
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Engagement
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_slug ON media_content(slug);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_content(media_type);
CREATE INDEX IF NOT EXISTS idx_media_published ON media_content(published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_category ON media_content(category);

-- Create social_media_posts table for tracking social media publications
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID, -- References posts.id or media_content.id
  content_type TEXT CHECK (content_type IN ('blog', 'video', 'podcast')),

  platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'mastodon', 'bluesky', 'medium')),
  post_text TEXT NOT NULL,
  post_url TEXT, -- URL of the published social media post

  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Platform-specific metadata
  platform_metadata JSONB,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_media_accounts table for storing credentials
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT UNIQUE CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'mastodon', 'bluesky', 'medium', 'buffer')),
  account_handle TEXT,

  -- API credentials (should be encrypted at rest)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for social media tables
CREATE INDEX IF NOT EXISTS idx_social_posts_content ON social_media_posts(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_media_posts(status);

-- Add RLS policies (Row Level Security)
ALTER TABLE media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published media
CREATE POLICY "Public can view published media"
  ON media_content FOR SELECT
  USING (published = true);

-- Allow public read access to published social posts
CREATE POLICY "Public can view published social posts"
  ON social_media_posts FOR SELECT
  USING (status = 'published');

-- Note: For admin access, you'll need to set up proper authentication
-- These are placeholder policies - adjust based on your auth setup
CREATE POLICY "Admin full access to media"
  ON media_content FOR ALL
  USING (true);

CREATE POLICY "Admin full access to social posts"
  ON social_media_posts FOR ALL
  USING (true);

CREATE POLICY "Admin full access to social accounts"
  ON social_media_accounts FOR ALL
  USING (true);
