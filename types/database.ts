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

export interface Category {
  id: string;
  name: string;
  page?: string | null;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  page?: string | null;
}

// Pages that categories can be mapped to.
// 'none' is the UI sentinel for "no specific page" — stored as NULL in the database.
export const SITE_PAGES = [
  { label: 'All Posts only', value: 'none' },
  { label: 'NiData', value: 'ni-data' },
  { label: 'Personal Reflections', value: 'personal-reflections' },
  { label: 'Business & Technology', value: 'business-technology' },
  { label: 'Market Intelligence', value: 'market-intelligence' },
] as const;

export interface Reflection {
  id: string;
  title: string;
  thought?: string;
  image_url?: string;
  video_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReflectionFormData {
  title: string;
  thought?: string;
  image_url?: string;
  video_url?: string;
  published: boolean;
}

// Category options
export const POST_CATEGORIES = [
  'AI Innovation',
  'Culture',
  'Management',
  'Data Engineering',
  'NiData Journey',
  'Personal Reflections'
] as const;

export type PostCategory = typeof POST_CATEGORIES[number];

// Sentiment options
export const SENTIMENT_OPTIONS = ['positive', 'neutral', 'negative'] as const;
export type Sentiment = typeof SENTIMENT_OPTIONS[number];
