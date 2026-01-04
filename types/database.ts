// src/types/database.ts
// TypeScript types for Supabase database tables

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  image_url?: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  url?: string;
  image_url?: string;
  featured: boolean;
  published_date: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface MarketData {
  id: string;
  company_name: string;
  ticker?: string;
  company_type: 'ai' | 'chip' | 'infrastructure';
  market_cap?: number;
  price?: number;
  change_percent?: number;
  data_date: string;
  created_at: string;
}

export interface PrivateValuation {
  id: string;
  company_name: string;
  valuation: string;
  last_update: string;
  company_type: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  created_at: string;
}

// API Response types
export interface MarketChartData {
  month: string;
  aiMarketCap: number;
  chipMarketCap: number;
  sentiment: number;
}

export interface CompanyInfo {
  name: string;
  ticker?: string;
  type: 'ai' | 'chip' | 'infrastructure' | 'public' | 'private';
  marketCap?: number;
  valuation?: string;
  price?: number;
  change?: number;
  lastUpdate?: string;
}

// Form types
export interface PostFormData {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image_url?: string;
  published: boolean;
  featured: boolean;
}

export interface NewsFormData {
  title: string;
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  url?: string;
  image_url?: string;
  featured?: boolean;
  published_date: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

// Category options
export const POST_CATEGORIES = [
  'AI Innovation',
  'Culture',
  'Management',
  'Data Engineering',
  'NiData Journey'
] as const;

export type PostCategory = typeof POST_CATEGORIES[number];

// Sentiment options
export const SENTIMENT_OPTIONS = ['positive', 'neutral', 'negative'] as const;
export type Sentiment = typeof SENTIMENT_OPTIONS[number];

// Media content types
export interface MediaContent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  media_type: 'video' | 'podcast' | 'audio';
  hosting_type: 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'self-hosted';
  embed_url?: string;
  media_url?: string;
  duration?: number;
  thumbnail_url?: string;
  transcript?: string;
  show_notes?: string;
  category?: string;
  tags?: string[];
  season?: number;
  episode_number?: number;
  published: boolean;
  featured: boolean;
  published_date?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  download_count: number;
}

export interface MediaFormData {
  title: string;
  description?: string;
  media_type: 'video' | 'podcast' | 'audio';
  hosting_type: 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'self-hosted';
  embed_url?: string;
  media_url?: string;
  duration?: number;
  thumbnail_url?: string;
  transcript?: string;
  show_notes?: string;
  category?: string;
  tags?: string[];
  season?: number;
  episode_number?: number;
  published: boolean;
  featured: boolean;
}

// Social media types
export interface SocialMediaPost {
  id: string;
  content_id?: string;
  content_type: 'blog' | 'video' | 'podcast';
  platform: 'twitter' | 'linkedin' | 'facebook' | 'mastodon' | 'bluesky' | 'medium';
  post_text: string;
  post_url?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string;
  published_at?: string;
  platform_metadata?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaFormData {
  content_id?: string;
  content_type: 'blog' | 'video' | 'podcast';
  platforms: string[];
  post_text: string;
  scheduled_for?: string;
}

// Media hosting options
export const MEDIA_TYPES = ['video', 'podcast', 'audio'] as const;
export const HOSTING_TYPES = ['youtube', 'vimeo', 'spotify', 'soundcloud', 'self-hosted'] as const;
export const SOCIAL_PLATFORMS = ['twitter', 'linkedin', 'facebook', 'mastodon', 'bluesky', 'medium'] as const;
