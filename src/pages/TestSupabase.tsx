// Simple test page to verify Supabase connection
// Access at: /test-supabase

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TestSupabase = () => {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      console.log('🧪 Testing Supabase connection...');

      // Test 1: Check if Supabase client is configured
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      console.log('Environment variables:');
      console.log('  VITE_SUPABASE_URL:', url);
      console.log('  VITE_SUPABASE_PUBLISHABLE_KEY:', key ? '✅ Set' : '❌ Missing');

      if (!url || !key) {
        setStatus('❌ Environment variables not set');
        setError('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
        return;
      }

      // Test 2: Try to fetch market data
      try {
        console.log('Fetching market_data...');
        const { data: marketData, error: marketError } = await supabase
          .from('market_data')
          .select('*')
          .limit(5);

        if (marketError) {
          console.error('❌ Error:', marketError);
          setStatus('❌ Error fetching data');
          setError(marketError);
        } else {
          console.log('✅ Success! Records:', marketData?.length || 0);
          setStatus(`✅ Connected! Found ${marketData?.length || 0} records`);
          setData(marketData);
        }
      } catch (err) {
        console.error('❌ Exception:', err);
        setStatus('❌ Connection failed');
        setError(err);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

        <div className="space-y-6">
          {/* Status */}
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Status</h2>
            <p className="text-lg">{status}</p>
          </div>

          {/* Environment Variables */}
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
            <div className="font-mono text-sm space-y-1">
              <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || '❌ Not Set'}</p>
              <p>VITE_SUPABASE_PUBLISHABLE_KEY: {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not Set'}</p>
            </div>
          </div>

          {/* Error Details */}
          {error && (
            <div className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-950">
              <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-300">Error</h2>
              <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}

          {/* Data Preview */}
          {data && data.length > 0 && (
            <div className="p-4 border border-green-500 rounded-lg bg-green-50 dark:bg-green-950">
              <h2 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">Sample Data</h2>
              <pre className="text-sm overflow-auto">{JSON.stringify(data[0], null, 2)}</pre>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <h2 className="text-xl font-semibold mb-2">What This Means</h2>
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>Connected! Found X records</strong> - Everything works! Data is loading correctly.</li>
              <li>❌ <strong>Environment variables not set</strong> - Need to set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env / build environment.</li>
              <li>❌ <strong>Could not find the table</strong> - Tables don't exist yet. Run the SQL migration in Supabase.</li>
              <li>❌ <strong>Row-level security</strong> - RLS is blocking access. Need to disable RLS on public tables.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase;
