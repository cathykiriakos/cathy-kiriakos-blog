// scripts/generate-daily-digest.js
// Generates a daily digest of market data and news

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function generateDailyDigest() {
  console.log('Generating daily digest...');

  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch today's market data
    const { data: marketData, error: marketError } = await supabase
      .from('market_data')
      .select('*')
      .eq('data_date', today)
      .order('market_cap', { ascending: false });

    if (marketError) {
      console.error('Error fetching market data:', marketError);
      return;
    }

    // Fetch today's news
    const { data: newsData, error: newsError } = await supabase
      .from('news_items')
      .select('*')
      .gte('published_date', today)
      .order('published_date', { ascending: false })
      .limit(10);

    if (newsError) {
      console.error('Error fetching news:', newsError);
      return;
    }

    // Generate digest content
    let digest = `# Daily Market Intelligence Digest - ${today}\n\n`;

    // Market Summary
    if (marketData && marketData.length > 0) {
      digest += `## 📊 Market Summary\n\n`;
      digest += `**Companies Tracked:** ${marketData.length}\n\n`;

      // Top performers
      const topPerformers = marketData
        .filter(item => item.change_percent > 0)
        .sort((a, b) => b.change_percent - a.change_percent)
        .slice(0, 5);

      if (topPerformers.length > 0) {
        digest += `### 🚀 Top Performers\n\n`;
        topPerformers.forEach(company => {
          digest += `- **${company.company_name}** (${company.ticker}): +${company.change_percent.toFixed(2)}%\n`;
        });
        digest += '\n';
      }

      // Biggest losers
      const biggestLosers = marketData
        .filter(item => item.change_percent < 0)
        .sort((a, b) => a.change_percent - b.change_percent)
        .slice(0, 5);

      if (biggestLosers.length > 0) {
        digest += `### 📉 Biggest Declines\n\n`;
        biggestLosers.forEach(company => {
          digest += `- **${company.company_name}** (${company.ticker}): ${company.change_percent.toFixed(2)}%\n`;
        });
        digest += '\n';
      }

      // Market cap leaders
      const marketCapLeaders = marketData.slice(0, 5);
      digest += `### 💰 Market Cap Leaders\n\n`;
      marketCapLeaders.forEach(company => {
        digest += `- **${company.company_name}**: $${company.market_cap?.toFixed(2)}B\n`;
      });
      digest += '\n';
    }

    // News Summary
    if (newsData && newsData.length > 0) {
      digest += `## 📰 Latest AI News\n\n`;

      const sentimentCount = newsData.reduce((acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
      }, {});

      digest += `**Articles:** ${newsData.length} | **Positive:** ${sentimentCount.positive || 0} | **Neutral:** ${sentimentCount.neutral || 0} | **Negative:** ${sentimentCount.negative || 0}\n\n`;

      newsData.slice(0, 5).forEach(item => {
        const sentimentEmoji = {
          positive: '🟢',
          neutral: '🟡',
          negative: '🔴'
        }[item.sentiment] || '🟡';

        digest += `${sentimentEmoji} **[${item.title}](${item.url})**\n`;
        digest += `*${item.source}* - ${item.summary}\n\n`;
      });
    }

    // Save digest to file
    const fs = await import('fs');
    const path = await import('path');

    const digestDir = 'daily-digests';
    if (!fs.existsSync(digestDir)) {
      fs.mkdirSync(digestDir);
    }

    const filename = `daily-digest-${today}.md`;
    const filepath = path.join(digestDir, filename);

    fs.writeFileSync(filepath, digest);

    console.log(`✅ Daily digest generated: ${filepath}`);

    // Optional: Create a database entry for the digest
    const { error: insertError } = await supabase
      .from('posts')
      .insert({
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
      });

    if (insertError) {
      console.error('Error saving digest to database:', insertError);
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