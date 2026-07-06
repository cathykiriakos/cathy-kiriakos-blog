// scripts/generate-daily-digest.js
// Generates a daily digest of market data and news.
//
// The news section uses the same editorial lens as the weekly signal
// (scripts/lib/signal-taxonomy.js): institutional items (UChicago / Booth /
// Center for Applied AI) lead, the rest is grouped by the three content
// pillars, and anything AI-adjacent that doesn't classify lands in a short
// "also on the radar" list so nothing silently disappears.
//
// Env:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY — required (unless using fixtures)
//   DIGEST_FIXTURES_PATH               — JSON file { market_data: [], news_items: [] }
//                                        to use instead of Supabase (testing);
//                                        also skips all database writes
//   DIGEST_DIR                         — output directory (default: daily-digests)

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  PILLARS,
  INSTITUTIONAL,
  classifyArticle,
  analyzeSentiment,
} from './lib/signal-taxonomy.js';

const FIXTURES_PATH = process.env.DIGEST_FIXTURES_PATH;
const DIGEST_DIR = process.env.DIGEST_DIR || 'daily-digests';

const SENTIMENT_EMOJI = { positive: '🟢', neutral: '🟡', negative: '🔴' };

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

async function loadData(today) {
  if (FIXTURES_PATH) {
    console.log(`Loading fixture data from ${FIXTURES_PATH}`);
    const fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH, 'utf8'));
    return { marketData: fixtures.market_data || [], newsData: fixtures.news_items || [] };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: marketData, error: marketError } = await supabase
    .from('market_data')
    .select('*')
    .eq('data_date', today)
    .order('market_cap', { ascending: false });

  if (marketError) {
    console.error('Error fetching market data:', marketError);
  }

  const { data: newsData, error: newsError } = await supabase
    .from('news_items')
    .select('*')
    .gte('published_date', today)
    .order('published_date', { ascending: false })
    .limit(25);

  if (newsError) {
    console.error('Error fetching news:', newsError);
  }

  return { marketData: marketData || [], newsData: newsData || [] };
}

// ---------------------------------------------------------------------------
// Market section (unchanged behavior)
// ---------------------------------------------------------------------------

function renderMarketSection(marketData) {
  if (!marketData || marketData.length === 0) return '';

  let section = `## 📊 Market Summary\n\n`;
  section += `**Companies Tracked:** ${marketData.length}\n\n`;

  const topPerformers = marketData
    .filter(item => item.change_percent > 0)
    .sort((a, b) => b.change_percent - a.change_percent)
    .slice(0, 5);

  if (topPerformers.length > 0) {
    section += `### 🚀 Top Performers\n\n`;
    topPerformers.forEach(company => {
      section += `- **${company.company_name}** (${company.ticker}): +${company.change_percent.toFixed(2)}%\n`;
    });
    section += '\n';
  }

  const biggestLosers = marketData
    .filter(item => item.change_percent < 0)
    .sort((a, b) => a.change_percent - b.change_percent)
    .slice(0, 5);

  if (biggestLosers.length > 0) {
    section += `### 📉 Biggest Declines\n\n`;
    biggestLosers.forEach(company => {
      section += `- **${company.company_name}** (${company.ticker}): ${company.change_percent.toFixed(2)}%\n`;
    });
    section += '\n';
  }

  const marketCapLeaders = marketData.slice(0, 5);
  section += `### 💰 Market Cap Leaders\n\n`;
  marketCapLeaders.forEach(company => {
    section += `- **${company.company_name}**: $${company.market_cap?.toFixed(2)}B\n`;
  });
  section += '\n';

  return section;
}

// ---------------------------------------------------------------------------
// News section — pillar-classified, institutional signal first
// ---------------------------------------------------------------------------

function renderNewsItem(item) {
  const emoji = SENTIMENT_EMOJI[item.sentiment] || '🟡';
  let line = `${emoji} **[${item.title}](${item.url})**\n`;
  line += `*${item.source}* - ${item.summary}\n\n`;
  return line;
}

function renderNewsSection(newsData) {
  if (!newsData || newsData.length === 0) return '';

  // Classify each row with the shared taxonomy. Rows in news_items don't
  // carry pillar fields, so this happens at digest time; sentiment is reused
  // from the row when present so it matches what the fetch step computed.
  const enriched = newsData.map(row => {
    const classified = classifyArticle(row);
    const sentiment =
      row.sentiment || analyzeSentiment(`${row.title} ${row.summary}`);
    return classified
      ? { ...classified, sentiment }
      : { ...row, sentiment, pillars: [], institutional_signal: false, unclassified: true };
  });

  const bySignal = [...enriched].sort(
    (a, b) => (b.relevance_score || 0) - (a.relevance_score || 0)
  );
  const institutionalItems = bySignal.filter(i => i.institutional_signal);
  const pillarItems = bySignal.filter(i => !i.institutional_signal && !i.unclassified);
  const radarItems = bySignal.filter(i => i.unclassified);

  const sentimentCount = enriched.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {});

  let section = `## 📰 Latest AI News\n\n`;
  section += `**Articles:** ${enriched.length} | **On-pillar:** ${institutionalItems.length + pillarItems.length} | **Positive:** ${sentimentCount.positive || 0} | **Neutral:** ${sentimentCount.neutral || 0} | **Negative:** ${sentimentCount.negative || 0}\n\n`;

  if (institutionalItems.length > 0) {
    section += `### 🏛️ ${INSTITUTIONAL.name}\n\n`;
    section += `*${INSTITUTIONAL.description}*\n\n`;
    institutionalItems.forEach(item => {
      section += renderNewsItem(item);
    });
  }

  for (const pillar of PILLARS) {
    const items = pillarItems
      .filter(i => i.primary_pillar === pillar.id)
      .slice(0, 3);
    if (items.length === 0) continue;

    section += `### 🧭 ${pillar.name}\n\n`;
    items.forEach(item => {
      section += renderNewsItem(item);
    });
  }

  if (radarItems.length > 0) {
    section += `### 📡 Also on the Radar\n\n`;
    radarItems.slice(0, 5).forEach(item => {
      const emoji = SENTIMENT_EMOJI[item.sentiment] || '🟡';
      section += `- ${emoji} [${item.title}](${item.url}) — *${item.source}*\n`;
    });
    section += '\n';
  }

  return section;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generateDailyDigest() {
  console.log('Generating daily digest...');

  const today = new Date().toISOString().split('T')[0];

  try {
    const { marketData, newsData } = await loadData(today);

    let digest = `# Daily Market Intelligence Digest - ${today}\n\n`;
    digest += renderMarketSection(marketData);
    digest += renderNewsSection(newsData);

    if (!fs.existsSync(DIGEST_DIR)) {
      fs.mkdirSync(DIGEST_DIR, { recursive: true });
    }

    const filename = `daily-digest-${today}.md`;
    const filepath = path.join(DIGEST_DIR, filename);

    fs.writeFileSync(filepath, digest);

    console.log(`✅ Daily digest generated: ${filepath}`);

    if (FIXTURES_PATH) {
      console.log('Fixture mode — skipping database write');
      return;
    }

    // Optional: Create a database entry for the digest
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error: insertError } = await supabase
      .from('posts')
      .upsert({
        title: `Daily Market Intelligence Digest - ${today}`,
        slug: `daily-digest-${today}`,
        category: 'market-intelligence',
        excerpt: `Automated daily summary of market data and AI news trends.`,
        content: digest,
        author: 'AI Assistant',
        published: false, // Set to true if you want to auto-publish
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'slug',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error('Error saving digest to database:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Digest saved to database as draft post');
    }

  } catch (error) {
    console.error('Error generating digest:', error);
    process.exit(1);
  }
}

// Run the digest generation
generateDailyDigest()
  .then(() => {
    console.log('Daily digest generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
