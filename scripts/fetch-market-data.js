// scripts/fetch-market-data.js
// Fetches real-time stock data and updates Supabase

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

// Companies to track
const COMPANIES = [
  { name: 'NVIDIA', ticker: 'NVDA', type: 'chip' },
  { name: 'Microsoft', ticker: 'MSFT', type: 'ai' },
  { name: 'Google/Alphabet', ticker: 'GOOGL', type: 'ai' },
  { name: 'Meta', ticker: 'META', type: 'ai' },
  { name: 'Amazon', ticker: 'AMZN', type: 'ai' },
  { name: 'Apple', ticker: 'AAPL', type: 'ai' },
  { name: 'AMD', ticker: 'AMD', type: 'chip' },
  { name: 'Intel', ticker: 'INTC', type: 'chip' },
  { name: 'TSMC', ticker: 'TSM', type: 'chip' },
  { name: 'Broadcom', ticker: 'AVGO', type: 'chip' },
  { name: 'Qualcomm', ticker: 'QCOM', type: 'chip' },
  { name: 'ARM Holdings', ticker: 'ARM', type: 'chip' },
  { name: 'Oracle', ticker: 'ORCL', type: 'ai' },
  { name: 'Snowflake', ticker: 'SNOW', type: 'infrastructure' },
];

// Delay between API calls to respect rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchStockData(ticker) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await axios.get(url);
    
    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      console.log(`No data for ${ticker}, might have hit rate limit`);
      return null;
    }

    return {
      ticker,
      price: parseFloat(quote['05. price']),
      change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      latest_trading_day: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);
    return null;
  }
}

async function calculateMarketCap(ticker, price) {
  // Approximate shares outstanding (you can maintain this in a config or database)
  const sharesOutstanding = {
    'NVDA': 2.46e9,
    'MSFT': 7.43e9,
    'GOOGL': 12.3e9,
    'META': 2.53e9,
    'AMZN': 10.3e9,
    'AAPL': 15.3e9,
    'AMD': 1.62e9,
    'INTC': 4.26e9,
    'TSM': 51.9e9,
    'AVGO': 463e6,
    'QCOM': 1.12e9,
    'ARM': 1.04e9,
    'ORCL': 2.76e9,
    'SNOW': 328e6,
  };

  const shares = sharesOutstanding[ticker] || 1e9; // Default fallback
  return (price * shares) / 1e9; // Market cap in billions
}

async function updateMarketData() {
  console.log('Starting market data update...');
  const today = new Date().toISOString().split('T')[0];
  const marketDataRecords = [];

  for (let i = 0; i < COMPANIES.length; i++) {
    const company = COMPANIES[i];
    console.log(`Fetching ${company.name} (${company.ticker})...`);
    
    const stockData = await fetchStockData(company.ticker);
    
    if (stockData) {
      const marketCap = await calculateMarketCap(company.ticker, stockData.price);
      
      marketDataRecords.push({
        company_name: company.name,
        ticker: company.ticker,
        company_type: company.type,
        market_cap: marketCap,
        price: stockData.price,
        change_percent: stockData.change_percent,
        data_date: today,
      });
    }

    // Alpha Vantage free tier: 5 calls/minute, 500 calls/day
    // Wait 15 seconds between calls to stay under limit
    if (i < COMPANIES.length - 1) {
      await delay(15000);
    }
  }

  // Upsert to Supabase
  if (marketDataRecords.length > 0) {
    const { data, error } = await supabase
      .from('market_data')
      .upsert(marketDataRecords, {
        onConflict: 'ticker,data_date',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error upserting market data:', error);
    } else {
      console.log(`✅ Successfully updated ${marketDataRecords.length} companies`);
      
      // Log summary
      const totalMarketCap = marketDataRecords.reduce((sum, r) => sum + r.market_cap, 0);
      console.log(`📊 Total market cap: $${totalMarketCap.toFixed(2)}B`);
    }
  }
}

// Run the update
updateMarketData()
  .then(() => {
    console.log('Market data update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
