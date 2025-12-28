// scripts/fetch-ai-news.js
// Fetches AI news from multiple sources and performs sentiment analysis

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NYT_API_KEY = process.env.NYT_API_KEY;
const NPR_API_KEY = process.env.NPR_API_KEY;

// Simple sentiment analysis based on keywords
function analyzeSentiment(text) {
  const positiveWords = [
    'breakthrough', 'innovation', 'success', 'growth', 'advance', 'improved',
    'efficient', 'powerful', 'revolutionary', 'leading', 'milestone', 'achievement',
    'soaring', 'surge', 'gain', 'boost', 'optimistic', 'promising'
  ];
  
  const negativeWords = [
    'concern', 'risk', 'threat', 'decline', 'fail', 'loss', 'criticism',
    'controversy', 'challenge', 'problem', 'bubble', 'crash', 'collapse',
    'warning', 'danger', 'falling', 'plunge', 'worry', 'fear'
  ];

  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

async function fetchNewsAPI() {
  console.log('Fetching from NewsAPI...');
  
  try {
    const url = `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+DeepSeek+OR+OpenAI+OR+Anthropic&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;
    const response = await axios.get(url);
    
    return response.data.articles.slice(0, 10).map(article => ({
      title: article.title,
      source: article.source.name,
      summary: article.description || article.content?.substring(0, 200) || '',
      url: article.url,
      published_date: article.publishedAt.split('T')[0],
      sentiment: analyzeSentiment(article.title + ' ' + article.description),
    }));
  } catch (error) {
    console.error('NewsAPI error:', error.message);
    return [];
  }
}

async function fetchNYTimes() {
  if (!NYT_API_KEY) return [];
  
  console.log('Fetching from NYT...');
  
  try {
    const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=artificial+intelligence&sort=newest&api-key=${NYT_API_KEY}`;
    const response = await axios.get(url);
    
    return response.data.response.docs.slice(0, 5).map(article => ({
      title: article.headline.main,
      source: 'New York Times',
      summary: article.abstract || article.snippet || '',
      url: article.web_url,
      published_date: article.pub_date.split('T')[0],
      sentiment: analyzeSentiment(article.headline.main + ' ' + article.abstract),
    }));
  } catch (error) {
    console.error('NYT API error:', error.message);
    return [];
  }
}

async function fetchNPR() {
  if (!NPR_API_KEY) return [];
  
  console.log('Fetching from NPR...');
  
  try {
    const url = `https://api.npr.org/query?searchTerm=artificial+intelligence&apiKey=${NPR_API_KEY}&output=JSON&numResults=5`;
    const response = await axios.get(url);
    
    if (response.data.list?.story) {
      return response.data.list.story.map(story => ({
        title: story.title?.$text || story.title || '',
        source: 'NPR',
        summary: story.teaser?.$text || story.miniTeaser?.$text || '',
        url: story.link?.[0]?.$text || '',
        published_date: story.storyDate?.$text?.split(' ')[0] || new Date().toISOString().split('T')[0],
        sentiment: analyzeSentiment((story.title?.$text || '') + ' ' + (story.teaser?.$text || '')),
      }));
    }
    return [];
  } catch (error) {
    console.error('NPR API error:', error.message);
    return [];
  }
}

async function updateAINews() {
  console.log('Starting AI news update...');
  
  // Fetch from all sources in parallel
  const [newsApiArticles, nytArticles, nprArticles] = await Promise.all([
    fetchNewsAPI(),
    fetchNYTimes(),
    fetchNPR(),
  ]);

  // Combine and deduplicate by title
  const allArticles = [...newsApiArticles, ...nytArticles, ...nprArticles];
  const uniqueArticles = Array.from(
    new Map(allArticles.map(item => [item.title, item])).values()
  );

  console.log(`Found ${uniqueArticles.length} unique articles`);

  // Check for existing articles to avoid duplicates
  const { data: existingNews } = await supabase
    .from('news_items')
    .select('title')
    .gte('published_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const existingTitles = new Set(existingNews?.map(n => n.title) || []);
  
  // Filter out already saved articles
  const newArticles = uniqueArticles.filter(article => 
    !existingTitles.has(article.title) && article.title && article.summary
  );

  console.log(`${newArticles.length} new articles to save`);

  if (newArticles.length > 0) {
    const { data, error } = await supabase
      .from('news_items')
      .insert(newArticles);

    if (error) {
      console.error('Error inserting news:', error);
    } else {
      console.log(`✅ Successfully saved ${newArticles.length} news items`);
      
      // Log sentiment distribution
      const sentimentCounts = newArticles.reduce((acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Sentiment distribution:', sentimentCounts);
    }
  }

  return newArticles;
}

// Run the update
updateAINews()
  .then(() => {
    console.log('AI news update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
