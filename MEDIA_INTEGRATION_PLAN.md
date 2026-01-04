# Media Integration & Social Media Publishing Plan

## Overview
This document outlines the implementation plan for adding video/podcast content capabilities and social media publishing integration to the personal blog platform.

## 1. Video & Podcast Content Integration

### 1.1 Database Schema Extensions

#### New Table: `media_content`
```sql
CREATE TABLE media_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'podcast', 'audio')),

  -- Media hosting options
  hosting_type TEXT CHECK (hosting_type IN ('youtube', 'vimeo', 'spotify', 'anchor', 'soundcloud', 'self-hosted')),
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

-- Index for performance
CREATE INDEX idx_media_slug ON media_content(slug);
CREATE INDEX idx_media_type ON media_content(media_type);
CREATE INDEX idx_media_published ON media_content(published, published_date DESC);
```

### 1.2 Supported Platforms

#### Video Platforms
1. **YouTube** (Recommended)
   - Embed support via iframe
   - Free hosting
   - Built-in analytics
   - Automatic transcoding

2. **Vimeo**
   - Professional presentation
   - Privacy controls
   - Ad-free experience

3. **Self-Hosted**
   - Full control
   - Requires CDN/storage (e.g., AWS S3, Cloudflare Stream)

#### Podcast/Audio Platforms
1. **Spotify for Podcasters** (formerly Anchor)
   - Free hosting
   - Auto-distribution to Spotify, Apple Podcasts, etc.
   - Analytics

2. **SoundCloud**
   - Easy embedding
   - Social features

3. **Self-Hosted**
   - RSS feed generation
   - Full control over distribution

### 1.3 UI Components

#### MediaPlayer Component
```typescript
interface MediaPlayerProps {
  mediaType: 'video' | 'podcast' | 'audio';
  embedUrl?: string;
  mediaUrl?: string;
  hostingType: string;
  thumbnail?: string;
  transcript?: string;
}
```

Features:
- Responsive player
- Transcript toggle
- Speed controls (for podcasts)
- Download option (if allowed)
- Share buttons

#### MediaCard Component
Similar to BlogCard but optimized for media:
- Play button overlay on thumbnail
- Duration display
- Episode number (for podcasts)
- Download count

### 1.4 Admin Panel Integration

Add new tab in Admin panel:
- **Media** tab for creating video/podcast entries
- Form fields:
  - Title, Description
  - Media Type (video/podcast/audio)
  - Hosting Type dropdown
  - Embed URL or Upload (for self-hosted)
  - Thumbnail upload
  - Transcript editor (with auto-transcription suggestion)
  - Show notes (rich text editor)
  - Season/Episode numbers
  - Category, Tags
  - Published toggle

### 1.5 Pages to Update/Create

1. **Update `/podcast` page**
   - Display list of podcast episodes
   - Filter by season/category
   - Search functionality

2. **Create `/video` page**
   - Video gallery view
   - Category filters
   - Featured videos section

3. **Create `/media/:slug` detail page**
   - Media player at top
   - Transcript (collapsible)
   - Show notes
   - Related content
   - Comments (optional)
   - Social share buttons

---

## 2. Social Media Publishing Integration

### 2.1 Supported Platforms

1. **Twitter/X**
2. **LinkedIn**
3. **Facebook**
4. **Mastodon** (for open web)
5. **Bluesky** (emerging platform)

### 2.2 Database Schema

#### New Table: `social_media_posts`
```sql
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID, -- References posts.id or media_content.id
  content_type TEXT CHECK (content_type IN ('blog', 'video', 'podcast')),

  platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'mastodon', 'bluesky')),
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

-- Store social media credentials (encrypted)
CREATE TABLE social_media_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT UNIQUE CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'mastodon', 'bluesky')),
  account_handle TEXT,

  -- OAuth tokens (should be encrypted at rest)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Implementation Approaches

#### Option A: Third-Party Service (Recommended for MVP)
Use a service like **Buffer**, **Hootsuite**, or **Zapier**:
- Pros:
  - Quick implementation
  - No need to manage OAuth flows
  - Scheduling features built-in
  - Analytics included
- Cons:
  - Monthly costs
  - Less customization
  - Dependent on third-party

#### Option B: Direct API Integration
Build custom integrations with each platform:
- Pros:
  - Full control
  - No monthly fees
  - Custom workflows
- Cons:
  - Complex OAuth implementations
  - Need to maintain API integrations
  - Rate limiting challenges

#### Option C: Hybrid Approach (Recommended)
- Use **Buffer API** or **Zapier Webhooks** for posting
- Store post status and URLs in your database
- Custom UI in Admin panel

### 2.4 UI Features

#### Admin Panel - Social Media Tab

**Post Composer:**
- Preview of blog post/media
- Platform checkboxes (Twitter, LinkedIn, Facebook, etc.)
- Character count per platform
- Platform-specific previews
- Template variables: `{title}`, `{excerpt}`, `{url}`
- Image selection/cropping for each platform
- Schedule datetime picker
- "Publish Now" or "Schedule" buttons

**Post Templates:**
```
Blog Post Template (Twitter):
Just published: {title}

{excerpt}

Read more: {url}
#AI #DataEngineering #Tech

Blog Post Template (LinkedIn):
I'm excited to share my latest thoughts on {title}

{excerpt}

Full article: {url}

What are your thoughts on this? Let me know in the comments!

Podcast Template (Twitter):
🎙️ New episode is live!

Ep. {episode}: {title}

{excerpt}

Listen now: {url}
```

**Social Media Dashboard:**
- List of published posts
- Post status (published, scheduled, failed)
- Analytics (likes, shares, comments) - if using third-party service
- Quick re-share button
- Edit scheduled posts

### 2.5 Publishing Workflow

1. **User creates blog post/media**
2. **Clicks "Publish" in Admin panel**
3. **Modal appears: "Share on Social Media?"**
4. **User selects platforms and customizes message**
5. **Posts are either:**
   - Published immediately
   - Scheduled for future date
   - Saved as drafts

### 2.6 Technical Implementation Steps

#### Phase 1: Buffer/Zapier Integration (Quick Win)
1. Set up Buffer account
2. Create Buffer API integration
3. Add "Share" button in Admin panel
4. Create social media posting form
5. Implement Buffer API calls

#### Phase 2: Custom UI & Templates
1. Add social_media_posts table
2. Create SocialMediaComposer component
3. Build template system
4. Add character counter per platform
5. Implement post preview

#### Phase 3: Scheduling & Analytics
1. Add scheduling functionality
2. Create cron job to publish scheduled posts
3. Pull analytics from Buffer API
4. Display in dashboard

#### Phase 4: Direct API Integration (Optional)
1. Implement OAuth flows for each platform
2. Build direct posting APIs
3. Handle rate limiting
4. Error handling and retry logic

---

## 3. Implementation Priority

### Phase 1 (Immediate - 1-2 days)
- [ ] Create `media_content` table in Supabase
- [ ] Build MediaPlayer component for YouTube/Spotify embeds
- [ ] Update Podcast page to display media content
- [ ] Add Media tab in Admin panel

### Phase 2 (Week 1)
- [ ] Create Video page
- [ ] Build MediaCard component
- [ ] Implement media detail page (`/media/:slug`)
- [ ] Add transcript display

### Phase 3 (Week 2)
- [ ] Set up Buffer account
- [ ] Create social media posting form
- [ ] Implement Buffer API integration
- [ ] Add post templates

### Phase 4 (Week 3+)
- [ ] Social media analytics dashboard
- [ ] Scheduling system
- [ ] Advanced media features (playlists, series)
- [ ] Self-hosted media support

---

## 4. Required Dependencies

### NPM Packages
```json
{
  "react-player": "^2.13.0",        // Universal media player
  "buffer-api": "^1.0.0",           // Buffer API client (if using Buffer)
  "date-fns": "^2.30.0",            // Date formatting for scheduling
  "react-textarea-autosize": "^8.5.0" // Auto-resize textareas
}
```

### Environment Variables
```env
# Social Media Integration
VITE_BUFFER_ACCESS_TOKEN=your_token_here

# Or if using direct APIs:
VITE_TWITTER_API_KEY=
VITE_TWITTER_API_SECRET=
VITE_LINKEDIN_CLIENT_ID=
VITE_LINKEDIN_CLIENT_SECRET=
```

---

## 5. Security Considerations

1. **OAuth Tokens:**
   - Store encrypted in database
   - Use Supabase Row-Level Security (RLS)
   - Implement token refresh logic

2. **Rate Limiting:**
   - Implement queue system for posts
   - Respect platform rate limits
   - Add retry logic with exponential backoff

3. **Content Moderation:**
   - Preview before posting
   - Character limit validation
   - Image size/format validation

4. **Privacy:**
   - Option to post as draft first
   - Unlisted/private media options
   - Delete from platforms if blog post is deleted

---

## 6. Analytics & Metrics

Track the following:
- Media views/plays
- Download counts
- Social media engagement (likes, shares, comments)
- Click-through rates from social to blog
- Most popular platforms
- Best posting times

---

## 7. RSS Feed for Podcasts

If hosting podcasts, generate RSS feed:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Your Podcast Name</title>
    <link>https://yourdomain.com/podcast</link>
    <description>Podcast description</description>
    <itunes:image href="https://yourdomain.com/podcast-art.jpg"/>

    <item>
      <title>Episode Title</title>
      <description>Episode description</description>
      <enclosure url="https://yourdomain.com/episode.mp3" type="audio/mpeg"/>
      <guid>unique-episode-id</guid>
      <pubDate>Fri, 03 Jan 2026 10:00:00 EST</pubDate>
      <itunes:duration>1234</itunes:duration>
    </item>
  </channel>
</rss>
```

---

## 8. Example User Flows

### Publishing a Podcast Episode
1. User records podcast, uploads to Spotify for Podcasters
2. Gets embed URL from Spotify
3. Goes to Admin panel > Media tab
4. Clicks "Add New Media"
5. Fills in:
   - Title: "Episode 5: The Future of AI"
   - Type: Podcast
   - Hosting: Spotify
   - Embed URL: [paste]
   - Description, Show Notes
6. Adds transcript (manual or auto-generated)
7. Clicks "Publish"
8. Modal asks: "Share on social media?"
9. User customizes posts for Twitter, LinkedIn
10. Posts are published immediately

### Publishing a Video
1. User uploads video to YouTube
2. Gets embed code
3. Admin panel > Media tab > Add New Media
4. Type: Video, Hosting: YouTube
5. Paste embed URL
6. Add thumbnail, description
7. Publish
8. Share on social media with custom messages

---

## Next Steps

1. Review this plan with stakeholder
2. Prioritize features based on immediate needs
3. Set up development environment
4. Create database migrations
5. Begin Phase 1 implementation

