// scripts/fetch-ai-news.js
// Fetches AI news from multiple sources (NewsAPI, NYT, NPR), classifies each
// article against the blog's three structural pillars plus an institutional
// tracking filter (see scripts/lib/signal-taxonomy.js), scores relevance,
// and emits data/weekly_signal.json with the top items. New articles are
// also upserted into Supabase (news_items).
//
// Env:
//   NEWS_API_KEY, NYT_API_KEY, NPR_API_KEY   — source APIs (each optional; skipped if absent)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY       — optional; DB write is skipped if absent
//   WEEKLY_SIGNAL_PATH                       — output path (default: data/weekly_signal.json)
//   WEEKLY_SIGNAL_LIMIT                      — max items in the payload (default: 20)
//   NEWS_FIXTURES_PATH                       — JSON file of articles to use instead of live APIs (testing)

import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import {
  PILLARS,
  INSTITUTIONAL,
  WINDOW_DAYS,
  classifyArticle,
  analyzeSentiment,
} from './lib/signal-taxonomy.js';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NYT_API_KEY = process.env.NYT_API_KEY;
const NPR_API_KEY = process.env.NPR_API_KEY;

const OUTPUT_PATH = process.env.WEEKLY_SIGNAL_PATH || 'data/weekly_signal.json';
const TOP_N = parseInt(process.env.WEEKLY_SIGNAL_LIMIT || '20', 10);

// ---------------------------------------------------------------------------
// Source fetchers — each returns [{ title, source, summary, url, published_date }]
// ---------------------------------------------------------------------------

const windowStart = () =>
  new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().split('T')[0];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// One targeted query per pillar plus the institutional filter, so candidate
// articles actually cover the taxonomy instead of just generic AI headlines.
const NEWSAPI_QUERIES = [
  '"Model Context Protocol" OR "context engineering" OR "AI orchestration" OR "agentic AI" OR "AI agents"',
  '"AI governance" OR "AI guardrails" OR "automated compliance" OR "responsible AI" OR "AI regulation"',
  '"human-in-the-loop" OR "human-centered AI" OR ("cognitive load" AND AI) OR ("user experience" AND AI)',
  '"UChicago Booth" OR "Polsky Center" OR "Center for Applied AI" OR "mecha-nudges" OR ("University of Chicago" AND AI)',
  'artificial intelligence OR OpenAI OR Anthropic OR DeepSeek OR "machine learning"',
];

async function fetchNewsAPI() {
  if (!NEWS_API_KEY) return [];

  console.log('Fetching from NewsAPI...');
  const articles = [];

  for (const q of NEWSAPI_QUERIES) {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q,
          from: windowStart(),
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 25,
          apiKey: NEWS_API_KEY,
        },
      });

      for (const article of response.data.articles || []) {
        articles.push({
          title: article.title,
          source: article.source?.name || 'NewsAPI',
          summary: article.description || article.content?.substring(0, 200) || '',
          url: article.url,
          published_date: article.publishedAt?.split('T')[0] || '',
        });
      }
    } catch (error) {
      console.error(`NewsAPI error for query "${q.slice(0, 50)}...":`, error.message);
    }
  }

  return articles;
}

const NYT_QUERIES = ['artificial intelligence', '"University of Chicago" AI'];

async function fetchNYTimes() {
  if (!NYT_API_KEY) return [];

  console.log('Fetching from NYT...');
  const articles = [];

  for (const [i, q] of NYT_QUERIES.entries()) {
    if (i > 0) await sleep(6000); // NYT article search allows ~5 requests/minute

    try {
      const response = await axios.get(
        'https://api.nytimes.com/svc/search/v2/articlesearch.json',
        {
          params: {
            q,
            sort: 'newest',
            begin_date: windowStart().replace(/-/g, ''),
            'api-key': NYT_API_KEY,
          },
        }
      );

      for (const article of response.data.response?.docs || []) {
        articles.push({
          title: article.headline?.main || '',
          source: 'New York Times',
          summary: article.abstract || article.snippet || '',
          url: article.web_url,
          published_date: article.pub_date?.split('T')[0] || '',
        });
      }
    } catch (error) {
      console.error(`NYT API error for query "${q}":`, error.message);
    }
  }

  return articles;
}

async function fetchNPR() {
  if (!NPR_API_KEY) return [];

  console.log('Fetching from NPR...');

  try {
    const url = `https://api.npr.org/query?searchTerm=artificial+intelligence&apiKey=${NPR_API_KEY}&output=JSON&numResults=10`;
    const response = await axios.get(url);

    if (response.data.list?.story) {
      return response.data.list.story.map(story => ({
        title: story.title?.$text || story.title || '',
        source: 'NPR',
        summary: story.teaser?.$text || story.miniTeaser?.$text || '',
        url: story.link?.[0]?.$text || '',
        published_date: story.storyDate?.$text?.split(' ')[0] || new Date().toISOString().split('T')[0],
      }));
    }
    return [];
  } catch (error) {
    console.error('NPR API error:', error.message);
    return [];
  }
}

async function fetchAllSources() {
  // Fixture mode for local testing without API keys
  if (process.env.NEWS_FIXTURES_PATH) {
    console.log(`Loading fixture articles from ${process.env.NEWS_FIXTURES_PATH}`);
    return JSON.parse(fs.readFileSync(process.env.NEWS_FIXTURES_PATH, 'utf8'));
  }

  const [newsApiArticles, nytArticles, nprArticles] = await Promise.all([
    fetchNewsAPI(),
    fetchNYTimes(),
    fetchNPR(),
  ]);
  return [...newsApiArticles, ...nytArticles, ...nprArticles];
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function dedupeArticles(articles) {
  const seen = new Map();
  for (const article of articles) {
    const key = article.url || (article.title || '').toLowerCase().trim();
    if (key && !seen.has(key)) seen.set(key, article);
  }
  // Second pass: collapse identical titles from different URLs
  const byTitle = new Map();
  for (const article of seen.values()) {
    const titleKey = (article.title || '').toLowerCase().trim();
    if (titleKey && !byTitle.has(titleKey)) byTitle.set(titleKey, article);
  }
  return [...byTitle.values()];
}

function withinWindow(article) {
  const age = (Date.now() - new Date(article.published_date).getTime()) / 86400000;
  // Allow up to 1 day in the "future" to absorb timezone skew from source APIs
  return !Number.isNaN(age) && age >= -1 && age <= WINDOW_DAYS;
}

function writeWeeklySignal(items) {
  const pillarCounts = Object.fromEntries(
    PILLARS.map(p => [p.id, items.filter(i => i.pillars.includes(p.id)).length])
  );

  const payload = {
    generated_at: new Date().toISOString(),
    window_days: WINDOW_DAYS,
    item_count: items.length,
    pillars: PILLARS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      item_count: pillarCounts[p.id],
    })),
    institutional_signal: {
      id: INSTITUTIONAL.id,
      name: INSTITUTIONAL.name,
      description: INSTITUTIONAL.description,
      tracked_keywords: INSTITUTIONAL.keywords.map(k => k.term),
      item_count: items.filter(i => i.institutional_signal).length,
    },
    items: items.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      source: item.source,
      url: item.url,
      summary: item.summary,
      published_date: item.published_date,
      relevance_score: item.relevance_score,
      primary_pillar: item.primary_pillar,
      pillars: item.pillars,
      institutional_signal: item.institutional_signal,
      matched_keywords: item.matched_keywords,
      sentiment: item.sentiment,
    })),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log(`📦 Wrote ${items.length} items to ${OUTPUT_PATH}`);
}

// ---------------------------------------------------------------------------
// Supabase persistence (unchanged schema: news_items)
// ---------------------------------------------------------------------------

async function saveToSupabase(articles) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('⚠️  SUPABASE_URL / SUPABASE_SERVICE_KEY not set — skipping database write');
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data: existingNews } = await supabase
    .from('news_items')
    .select('title')
    .gte('published_date', windowStart());

  const existingTitles = new Set(existingNews?.map(n => n.title) || []);

  const rows = articles
    .filter(
      article =>
        !existingTitles.has(article.title) &&
        article.title?.trim() &&
        article.summary?.trim() &&
        article.source &&
        article.published_date
    )
    .map(article => ({
      title: article.title,
      source: article.source,
      summary: article.summary,
      url: article.url,
      published_date: article.published_date,
      sentiment: article.sentiment,
      created_at: new Date().toISOString(),
    }));

  console.log(`${rows.length} valid new articles to save`);
  if (rows.length === 0) return;

  const { error } = await supabase
    .from('news_items')
    .upsert(rows, { onConflict: 'title,published_date', ignoreDuplicates: true });

  if (!error) {
    console.log(`✅ Successfully saved ${rows.length} news items`);
    return;
  }

  console.error('Error upserting news:', error);

  // Missing unique constraint (code 42P10) — fall back to plain insert
  if (error.code === '42P10') {
    console.log('⚠️  Missing unique constraint on (title, published_date)');
    console.log('📝 Please run the migration in supabase/migrations/add_unique_constraints.sql');
    console.log('🔄 Falling back to simple insert (may create duplicates)...');

    const { error: insertError } = await supabase.from('news_items').insert(rows);
    if (insertError) {
      console.error('Error inserting news items:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      console.error('Sample article data:', JSON.stringify(rows[0], null, 2));
    } else {
      console.log(`✅ Successfully inserted ${rows.length} news items using fallback method`);
      console.log('⚠️  Note: Without unique constraint, duplicates may occur over time');
    }
  } else {
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Sample article data:', JSON.stringify(rows[0], null, 2));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function updateAINews() {
  console.log('Starting AI news update...');

  const rawArticles = await fetchAllSources();
  const uniqueArticles = dedupeArticles(rawArticles);
  console.log(`Fetched ${rawArticles.length} articles, ${uniqueArticles.length} unique`);

  // Classify against the pillar taxonomy; drop anything that doesn't qualify
  const classified = uniqueArticles
    .filter(withinWindow)
    .map(classifyArticle)
    .filter(Boolean)
    .map(article => ({
      ...article,
      sentiment: analyzeSentiment(`${article.title} ${article.summary}`),
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score);

  const topItems = classified.slice(0, TOP_N);

  console.log(`${classified.length} articles matched the signal taxonomy (keeping top ${topItems.length})`);
  const pillarDistribution = Object.fromEntries(
    [...PILLARS, INSTITUTIONAL].map(p => [
      p.name,
      topItems.filter(i => i.pillars?.includes(p.id) || (p.id === INSTITUTIONAL.id && i.institutional_signal)).length,
    ])
  );
  console.log('📊 Pillar distribution:', pillarDistribution);

  writeWeeklySignal(topItems);
  await saveToSupabase(topItems);
}

updateAINews()
  .then(() => {
    console.log('AI news update complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
