// scripts/check-api-health.js
// Tests each API key with a lightweight call and exits non-zero if any critical key fails.
// Run manually:  SUPABASE_URL=... node scripts/check-api-health.js

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const results = [];
let criticalFailure = false;

function record(name, ok, reason, critical = true) {
  results.push({ name, ok, reason, critical });
  if (!ok && critical) criticalFailure = true;
}

async function checkSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    record('Supabase (SUPABASE_URL / SUPABASE_SERVICE_KEY)', false, 'one or both env vars not set');
    return;
  }

  try {
    const supabase = createClient(url, key);
    const { error } = await supabase.from('market_data').select('id').limit(1);
    if (error) throw new Error(error.message);
    record('Supabase', true);
  } catch (e) {
    record('Supabase (SUPABASE_URL / SUPABASE_SERVICE_KEY)', false, e.message);
  }
}

async function checkAlphaVantage() {
  const key = process.env.ALPHA_VANTAGE_KEY;

  if (!key) {
    record('Alpha Vantage (ALPHA_VANTAGE_KEY)', false, 'env var not set');
    return;
  }

  try {
    const { data } = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`
    );
    const quote = data['Global Quote'];
    if (quote && Object.keys(quote).length > 0) {
      record('Alpha Vantage (ALPHA_VANTAGE_KEY)', true);
    } else {
      const note = data?.Note || data?.Information || 'empty response — likely rate-limited';
      record('Alpha Vantage (ALPHA_VANTAGE_KEY)', false, note);
    }
  } catch (e) {
    record('Alpha Vantage (ALPHA_VANTAGE_KEY)', false, e.message);
  }
}

async function checkNYT() {
  const key = process.env.NYT_API_KEY;

  if (!key) {
    record('NYT (NYT_API_KEY)', false, 'env var not set', false);
    return;
  }

  try {
    const { data } = await axios.get(
      `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=AI&page=0&api-key=${key}`
    );
    if (data.status === 'OK') {
      record('NYT (NYT_API_KEY)', true);
    } else {
      record('NYT (NYT_API_KEY)', false, 'unexpected response status');
    }
  } catch (e) {
    const reason = e.response?.data?.fault?.faultstring || e.response?.data?.message || e.message;
    record('NYT (NYT_API_KEY)', false, reason);
  }
}

async function checkNewsAPI() {
  const key = process.env.NEWS_API_KEY;

  if (!key) {
    // Not a critical failure — NewsAPI is optional
    record('NewsAPI (NEWS_API_KEY)', false, 'env var not set', false);
    return;
  }

  try {
    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${key}`
    );
    if (data.status === 'ok') {
      record('NewsAPI (NEWS_API_KEY)', true, null, false);
    } else {
      // newsapi.org blocks server-side requests on the free developer plan —
      // treat as a warning rather than a critical failure.
      record('NewsAPI (NEWS_API_KEY)', false, data.message || 'non-ok status', false);
    }
  } catch (e) {
    const reason = e.response?.data?.message || e.message;
    record('NewsAPI (NEWS_API_KEY)', false, reason, false);
  }
}

async function main() {
  console.log('Running API health checks...\n');

  await Promise.all([checkSupabase(), checkAlphaVantage(), checkNYT(), checkNewsAPI()]);

  console.log('=== API Health Report ===\n');
  for (const r of results) {
    const icon = r.ok ? '✅' : r.critical ? '❌' : '⚠️ ';
    const detail = r.reason ? ` — ${r.reason}` : '';
    const tag = r.critical ? '' : ' (optional)';
    console.log(`${icon} ${r.name}${tag}${detail}`);
  }
  console.log('');

  if (criticalFailure) {
    console.log('❌ One or more critical API keys are invalid or missing.');
    console.log('   Check repo Settings → Secrets and variables → Actions');
    process.exit(1);
  } else {
    console.log('✅ All critical API keys are healthy.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Health check script crashed:', err);
  process.exit(1);
});
