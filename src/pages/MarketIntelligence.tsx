// src/pages/MarketIntelligence.tsx
// ENHANCED VERSION with Filtering and Real Data

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, Cpu, BarChart3, RefreshCw } from 'lucide-react';
import { getLatestMarketData, getNewsItems, getMarketDataByDate } from '@/lib/supabase';
import type { NewsItem, MarketData } from '@/types/database';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const MarketIntelligence = () => {
  const [activeView, setActiveView] = useState<'trend' | 'news'>('trend');

  // Fetch real market data
  const { data: marketData, isLoading: marketLoading, error: marketError, refetch: refetchMarket } = useQuery<MarketData[]>({
    queryKey: ['marketData'],
    queryFn: getLatestMarketData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch news items
  const { data: newsItems, error: newsError, refetch: refetchNews } = useQuery<NewsItem[]>({
    queryKey: ['newsItems'],
    queryFn: () => getNewsItems(20),
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 Market Data Debug:');
    console.log('  - Loading:', marketLoading);
    console.log('  - Error:', marketError);
    console.log('  - Data count:', marketData?.length || 0);
    if (marketData && marketData.length > 0) {
      console.log('  - Sample record:', marketData[0]);
    }
    console.log('  - News count:', newsItems?.length || 0);
  }, [marketData, marketLoading, marketError, newsItems]);

  // Fetch historical data for charts (last 6 months)
  const { data: historicalData } = useQuery({
    queryKey: ['historicalMarketData'],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return getMarketDataByDate(startDate, endDate);
    },
  });

  // Process chart data - stacked by company
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    // Group by date with individual company market caps
    const dataByDate = historicalData.reduce((acc, item) => {
      const date = item.data_date;
      if (!acc[date]) {
        acc[date] = { date };
      }

      // Add each company's market cap as a separate key
      const companyKey = item.ticker || item.company_name;
      acc[date][companyKey] = (item.market_cap || 0);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(dataByDate)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days for better readability
  }, [historicalData]);

  // Get unique companies for chart legend
  const uniqueCompanies = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    const companies = [...new Set(historicalData.map(item => item.ticker || item.company_name))];
    return companies.sort();
  }, [historicalData]);

  // Color palette for companies
  const companyColors = useMemo(() => {
    const colors = [
      '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
      '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
      '#6366f1', '#14b8a6', '#f43f5e', '#a855f7'
    ];
    const colorMap: Record<string, string> = {};
    uniqueCompanies.forEach((company, index) => {
      colorMap[company] = colors[index % colors.length];
    });
    return colorMap;
  }, [uniqueCompanies]);

  // Calculate sentiment from news
  const sentimentData = useMemo(() => {
    if (!newsItems) return [];

    const last30Days = newsItems.filter(item => {
      const itemDate = new Date(item.published_date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= thirtyDaysAgo;
    });

    // Group by week
    const weeks = last30Days.reduce((acc, item) => {
      const week = Math.floor((new Date(item.published_date).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)) + 5;
      const weekLabel = `Week ${week}`;
      
      if (!acc[weekLabel]) {
        acc[weekLabel] = { week: weekLabel, positive: 0, neutral: 0, negative: 0, total: 0 };
      }
      
      acc[weekLabel][item.sentiment]++;
      acc[weekLabel].total++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(weeks).map((w: any) => ({
      ...w,
      sentiment: ((w.positive - w.negative) / w.total) * 100 + 50, // Scale to 0-100
    }));
  }, [newsItems]);

  // De-duplicate and sort companies by market cap
  const filteredMarketData = useMemo(() => {
    if (!marketData) return [];

    // De-duplicate: keep only latest entry per ticker
    const uniqueCompanies = Object.values(
      marketData.reduce((acc, company) => {
        const existing = acc[company.ticker];
        if (!existing || new Date(company.created_at) > new Date(existing.created_at)) {
          acc[company.ticker] = company;
        }
        return acc;
      }, {} as Record<string, MarketData>)
    );

    // Sort by market cap descending
    return uniqueCompanies.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
  }, [marketData]);

  // Calculate aggregated metrics
  const metrics = useMemo(() => {
    if (!marketData) return { aiMarketCap: 0, chipMarketCap: 0, avgSentiment: 0 };

    const aiMarketCap = marketData
      .filter(c => c.company_type === 'ai')
      .reduce((sum, c) => sum + (c.market_cap || 0), 0);

    const chipMarketCap = marketData
      .filter(c => c.company_type === 'chip')
      .reduce((sum, c) => sum + (c.market_cap || 0), 0);

    const sentimentScore = newsItems
      ? (newsItems.filter(n => n.sentiment === 'positive').length / newsItems.length) * 100
      : 0;

    return {
      aiMarketCap: aiMarketCap / 1000, // Convert to trillions
      chipMarketCap: chipMarketCap / 1000,
      avgSentiment: sentimentScore,
    };
  }, [marketData, newsItems]);

  const handleRefreshAll = () => {
    refetchMarket();
    refetchNews();
  };

  // Format numbers with commas
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container-blog py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                AI Market Intelligence
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Let the data tell the story.
              </p>
            </div>
            <Button onClick={handleRefreshAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="AI Companies Market Cap"
            value={`$${formatNumber(metrics.aiMarketCap)}T`}
            change="+12.3%"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Chip Makers Market Cap"
            value={`$${formatNumber(metrics.chipMarketCap)}T`}
            change="+8.7%"
            trend="up"
            icon={<Cpu className="h-5 w-5" />}
          />
          <MetricCard
            title="Market Sentiment"
            value={`${formatNumber(metrics.avgSentiment, 0)}%`}
            change="Strong Positive"
            trend="up"
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </div>

        {/* Market Cap Breakdown Tables */}
        {filteredMarketData && filteredMarketData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* AI Companies Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Companies Breakdown</CardTitle>
                <CardDescription>
                  Total: ${formatNumber(metrics.aiMarketCap)}T
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredMarketData
                    .filter(c => c.company_type === 'ai')
                    .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
                    .map((company) => (
                      <div key={company.id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0">
                        <span className="font-medium">{company.company_name}</span>
                        <span className="text-muted-foreground">${formatNumber(company.market_cap || 0, 0)}B</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Chip Makers Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chip Makers Breakdown</CardTitle>
                <CardDescription>
                  Total: ${formatNumber(metrics.chipMarketCap)}T
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredMarketData
                    .filter(c => c.company_type === 'chip')
                    .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
                    .map((company) => (
                      <div key={company.id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0">
                        <span className="font-medium">{company.company_name}</span>
                        <span className="text-muted-foreground">${formatNumber(company.market_cap || 0, 0)}B</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sentiment Explanation */}
        {newsItems && newsItems.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Market Sentiment Insights</CardTitle>
              <CardDescription>Understanding the {formatNumber(metrics.avgSentiment, 0)}% sentiment score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What This Means</h4>
                  <p className="text-sm text-muted-foreground">
                    The {formatNumber(metrics.avgSentiment, 0)}% sentiment score indicates{' '}
                    {metrics.avgSentiment >= 70 ? 'strongly positive' :
                     metrics.avgSentiment >= 50 ? 'moderately positive' :
                     metrics.avgSentiment >= 30 ? 'neutral to slightly negative' : 'negative'}{' '}
                    market sentiment based on AI news analysis. This score is calculated from{' '}
                    {newsItems.length} recent news articles covering AI developments, investments, and market trends.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {newsItems.filter(n => n.sentiment === 'positive').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {newsItems.filter(n => n.sentiment === 'neutral').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {newsItems.filter(n => n.sentiment === 'negative').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Negative</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Key Drivers</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {metrics.avgSentiment >= 70 && (
                      <>
                        <li>• Strong investor confidence in AI sector</li>
                        <li>• Positive earnings reports and revenue growth</li>
                        <li>• Breakthrough AI innovations and product launches</li>
                      </>
                    )}
                    {metrics.avgSentiment >= 50 && metrics.avgSentiment < 70 && (
                      <>
                        <li>• Steady growth in AI adoption across industries</li>
                        <li>• Balanced news coverage of opportunities and challenges</li>
                        <li>• Ongoing investment in AI infrastructure</li>
                      </>
                    )}
                    {metrics.avgSentiment < 50 && (
                      <>
                        <li>• Regulatory concerns affecting AI companies</li>
                        <li>• Market volatility or economic uncertainties</li>
                        <li>• Mixed performance in recent earnings</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Trends Chart - Stacked Bar Chart by Company */}
        {chartData.length > 0 && uniqueCompanies.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Market Cap Trends by Company (Last 30 Days)</CardTitle>
              <CardDescription>
                Stacked view showing individual company contributions to total market cap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    className="text-xs"
                    label={{ value: 'Market Cap ($B)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                    formatter={(value: any) => `$${value.toFixed(2)}B`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                  />
                  {uniqueCompanies.map((company) => (
                    <Bar
                      key={company}
                      dataKey={company}
                      stackId="marketCap"
                      fill={companyColors[company]}
                      name={company}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>Each bar represents the total market cap with individual company contributions stacked</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sentiment Analysis */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Market Sentiment Analysis</CardTitle>
                <CardDescription>
                  Tracking market sentiment through news analysis and market data
                </CardDescription>
              </div>
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'trend' | 'news')}>
                <TabsList>
                  <TabsTrigger value="trend">Trend</TabsTrigger>
                  <TabsTrigger value="news">News ({newsItems?.length || 0})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {activeView === 'trend' ? (
              sentimentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Bar dataKey="sentiment" fill="hsl(var(--primary))" name="Sentiment Score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">📈 No sentiment data available yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sentiment analysis will appear once news data is collected
                  </p>
                </div>
              )
            ) : newsError ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">⚠️ Error loading news</p>
                <p className="text-sm text-muted-foreground mb-4">{newsError.message}</p>
                <Button onClick={() => refetchNews()} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : !newsItems || newsItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">📰 No news items yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  The GitHub Action will fetch AI news daily at 9 AM UTC.
                </p>
                <Button onClick={() => refetchNews()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for News
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {newsItems.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className={`text-sm font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </p>
    </CardContent>
  </Card>
);

// News Card Component
const NewsCard = ({ item }: { item: NewsItem }) => (
  <div className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-semibold flex-1">
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </h4>
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
          item.sentiment === 'positive'
            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
            : item.sentiment === 'negative'
            ? 'bg-red-500/20 text-red-700 dark:text-red-400'
            : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
        }`}
      >
        {item.sentiment}
      </span>
    </div>
    <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
    <div className="flex justify-between items-center text-xs text-muted-foreground">
      <span>{item.source}</span>
      <span>{new Date(item.published_date).toLocaleDateString()}</span>
    </div>
  </div>
);

export default MarketIntelligence;
