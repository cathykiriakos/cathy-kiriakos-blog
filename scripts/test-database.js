// Test script to verify data in Supabase
// Run this with: node scripts/test-database.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection and data...\n');

  // Test 1: Check market_data table
  console.log('📊 Checking market_data table...');
  const { data: marketData, error: marketError } = await supabase
    .from('market_data')
    .select('*')
    .order('data_date', { ascending: false })
    .limit(5);

  if (marketError) {
    console.error('❌ Error fetching market data:', marketError);
  } else {
    console.log(`✅ Found ${marketData?.length || 0} market data records`);
    if (marketData && marketData.length > 0) {
      console.log('Latest record:', marketData[0]);
    }
  }

  console.log('\n');

  // Test 2: Check news_items table
  console.log('📰 Checking news_items table...');
  const { data: newsData, error: newsError } = await supabase
    .from('news_items')
    .select('*')
    .order('published_date', { ascending: false })
    .limit(5);

  if (newsError) {
    console.error('❌ Error fetching news:', newsError);
  } else {
    console.log(`✅ Found ${newsData?.length || 0} news records`);
    if (newsData && newsData.length > 0) {
      console.log('Latest record:', newsData[0]);
    }
  }

  console.log('\n');

  // Test 3: Count total records
  console.log('📈 Total record counts...');
  const { count: marketCount, error: marketCountError } = await supabase
    .from('market_data')
    .select('*', { count: 'exact', head: true });

  const { count: newsCount, error: newsCountError } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true });

  if (!marketCountError) {
    console.log(`✅ Total market_data records: ${marketCount}`);
  }
  if (!newsCountError) {
    console.log(`✅ Total news_items records: ${newsCount}`);
  }

  console.log('\n');

  // Test 4: Test public access (using anon key)
  console.log('🔓 Testing public read access (anon key)...');
  const publicSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
  );

  const { data: publicData, error: publicError } = await publicSupabase
    .from('market_data')
    .select('*')
    .limit(1);

  if (publicError) {
    console.error('❌ Public access blocked:', publicError);
    console.error('⚠️  RLS is still blocking public reads!');
  } else {
    console.log('✅ Public read access works!');
    console.log(`   Retrieved ${publicData?.length || 0} records`);
  }
}

testDatabase()
  .then(() => {
    console.log('\n✅ Database test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
