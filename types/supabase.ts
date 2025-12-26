// src/lib/supabase.ts
// Supabase client configuration and helper functions

import { createClient } from '@supabase/supabase-js';
import type { 
  Post, 
  NewsItem, 
  MarketData, 
  PrivateValuation,
  ContactFormData,
  NewsletterFormData,
  PostFormData,
  NewsFormData
} from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== POSTS ====================

export const getPosts = async (options?: {
  category?: string;
  limit?: number;
  published?: boolean;
}) => {
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.published !== undefined) {
    query = query.eq('published', options.published);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Post[];
};

export const getPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) throw error;
  return data as Post;
};

export const getFeaturedPosts = async (limit = 3) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('featured', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Post[];
};

export const createPost = async (post: PostFormData) => {
  // Generate slug from title
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('posts')
    .insert([{ ...post, slug }])
    .select()
    .single();

  if (error) throw error;
  return data as Post;
};

export const updatePost = async (id: string, post: Partial<PostFormData>) => {
  const { data, error } = await supabase
    .from('posts')
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
};

export const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== NEWS ITEMS ====================

export const getNewsItems = async (limit = 10) => {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .order('published_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as NewsItem[];
};

export const createNewsItem = async (news: NewsFormData) => {
  const { data, error } = await supabase
    .from('news_items')
    .insert([news])
    .select()
    .single();

  if (error) throw error;
  return data as NewsItem;
};

export const deleteNewsItem = async (id: string) => {
  const { error } = await supabase
    .from('news_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== MARKET DATA ====================

export const getLatestMarketData = async () => {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .order('data_date', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as MarketData[];
};

export const getMarketDataByDate = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .gte('data_date', startDate)
    .lte('data_date', endDate)
    .order('data_date', { ascending: true });

  if (error) throw error;
  return data as MarketData[];
};

export const upsertMarketData = async (marketData: Omit<MarketData, 'id' | 'created_at'>[]) => {
  const { data, error } = await supabase
    .from('market_data')
    .upsert(marketData, { 
      onConflict: 'ticker,data_date',
      ignoreDuplicates: false 
    })
    .select();

  if (error) throw error;
  return data as MarketData[];
};

// ==================== PRIVATE VALUATIONS ====================

export const getPrivateValuations = async () => {
  const { data, error } = await supabase
    .from('private_valuations')
    .select('*')
    .order('company_name', { ascending: true });

  if (error) throw error;
  return data as PrivateValuation[];
};

export const updatePrivateValuation = async (
  id: string, 
  valuation: Partial<PrivateValuation>
) => {
  const { data, error } = await supabase
    .from('private_valuations')
    .update({ ...valuation, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as PrivateValuation;
};

// ==================== NEWSLETTER ====================

export const subscribeToNewsletter = async (email: string) => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email }])
    .select()
    .single();

  if (error) {
    // Handle duplicate email
    if (error.code === '23505') {
      throw new Error('This email is already subscribed');
    }
    throw error;
  }
  return data;
};

export const getNewsletterSubscribers = async () => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('subscribed', true)
    .order('subscribed_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ==================== CONTACT FORM ====================

export const submitContactForm = async (formData: ContactFormData) => {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert([formData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getContactSubmissions = async () => {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateContactStatus = async (
  id: string, 
  status: 'unread' | 'read' | 'responded'
) => {
  const { data, error } = await supabase
    .from('contact_submissions')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
