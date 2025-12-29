// src/pages/MarketIntelligence.tsx
// ENHANCED VERSION with Filtering and Real Data

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Cpu, BarChart3, Search, Filter, RefreshCw } from 'lucide-react';
import { getLatestMarketData, getPrivateValuations, getNewsItems, getMarketDataByDate } from '@/lib/supabase';
import type { NewsItem, MarketData, PrivateValuation } from '@/types/database';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState<'all' | 'ai' | 'chip' | 'infrastructure'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'market_cap' | 'change'>('market_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch real market data
  const { data: marketData, isLoading: marketLoading, error: marketError, refetch: refetchMarket } = useQuery<MarketData[]>({
    queryKey: ['marketData'],
    queryFn: getLatestMarketData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch private valuations
  const { data: privateValuations, error: privateError, refetch: refetchPrivate } = useQuery<PrivateValuation[]>({
    queryKey: ['privateValuations'],
    queryFn: getPrivateValuations,
  });

  // Fetch news items
  const { data: newsItems, error: newsError, refetch: refetchNews } = useQuery<NewsItem[]>({
    queryKey: ['newsItems'],
    queryFn: () => getNewsItems(20),
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  // Fetch historical data for charts (last 6 months)
  const { data: historicalData } = useQuery({
    queryKey: ['historicalMarketData'],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return getMarketDataByDate(startDate, endDate);
    },
  });

  // Process chart data
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    // Group by date and aggregate
    const dataByDate = historicalData.reduce((acc, item) => {
      const date = item.data_date;
      if (!acc[date]) {
        acc[date] = { date, aiMarketCap: 0, chipMarketCap: 0, count: 0 };
      }
      
      if (item.company_type === 'ai') {
        acc[date].aiMarketCap += item.market_cap || 0;
      } else if (item.company_type === 'chip') {
        acc[date].chipMarketCap += item.market_cap || 0;
      }
      acc[date].count++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dataByDate)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(-180); // Last 180 days
  }, [historicalData]);

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

  // Filter and sort companies
  const filteredMarketData = useMemo(() => {
    if (!marketData) return [];

    let filtered = marketData;

    // Filter by type
    if (companyTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.company_type === companyTypeFilter);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.company_name;
          bVal = b.company_name;
          break;
        case 'market_cap':
          aVal = a.market_cap || 0;
          bVal = b.market_cap || 0;
          break;
        case 'change':
          aVal = a.change_percent || 0;
          bVal = b.change_percent || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [marketData, companyTypeFilter, searchQuery, sortBy, sortOrder]);

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
    refetchPrivate();
    refetchNews();
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
                Real-time tracking of the AI revolution. We're not witnessing hype—we're living through 
                the biggest market disruption since the Industrial Revolution. The data tells the story.
              </p>
            </div>
            <Button onClick={handleRefreshAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            title="AI Companies Market Cap"
            value={`$${metrics.aiMarketCap.toFixed(2)}T`}
            change="+12.3%"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Chip Makers Market Cap"
            value={`$${metrics.chipMarketCap.toFixed(2)}T`}
            change="+8.7%"
            trend="up"
            icon={<Cpu className="h-5 w-5" />}
          />
          <MetricCard
            title="Market Sentiment"
            value={`${metrics.avgSentiment.toFixed(0)}%`}
            change="Strong Positive"
            trend="up"
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </div>

        {/* Market Trends Chart */}
        {chartData.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Market Cap Trends (Last 6 Months)</CardTitle>
              <CardDescription>
                Real-time tracking of AI and semiconductor market growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="aiMarketCap" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    name="AI Companies ($B)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="chipMarketCap" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2} 
                    name="Chip Makers ($B)" 
                  />
                </LineChart>
              </ResponsiveContainer>
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

        {/* Company Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies or tickers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={companyTypeFilter} onValueChange={(v: any) => setCompanyTypeFilter(v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ai">AI Companies</SelectItem>
                  <SelectItem value="chip">Chip Makers</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="change">% Change</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Trackers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Public Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Public AI & Chip Companies</CardTitle>
              <CardDescription>
                {filteredMarketData.length} companies • Real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marketLoading ? (
                <p className="text-muted-foreground">Loading market data...</p>
              ) : marketError ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-2">⚠️ Error loading market data</p>
                  <p className="text-sm text-muted-foreground mb-4">{marketError.message}</p>
                  <Button onClick={() => refetchMarket()} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : !filteredMarketData || filteredMarketData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">📊 No market data available yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    The GitHub Action will populate data daily at 9 AM UTC.
                  </p>
                  <Button onClick={() => refetchMarket()} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check for Data
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMarketData.map((company) => (
                    <CompanyRow
                      key={company.id}
                      name={company.company_name}
                      ticker={company.ticker || ''}
                      price={`$${company.price?.toFixed(2) || '--'}`}
                      change={company.change_percent?.toFixed(2) || '--'}
                      marketCap={`$${(company.market_cap || 0).toFixed(2)}B`}
                      type="public"
                    />
                  ))}
                </div>
              )}
              {filteredMarketData && filteredMarketData.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  📊 Data updates every 5 minutes • Last updated: {new Date().toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Private Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Private AI Labs & Startups</CardTitle>
              <CardDescription>Last reported valuations</CardDescription>
            </CardHeader>
            <CardContent>
              {privateError ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-2">⚠️ Error loading private valuations</p>
                  <p className="text-sm text-muted-foreground mb-4">{privateError.message}</p>
                  <Button onClick={() => refetchPrivate()} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : !privateValuations || privateValuations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">💰 No private valuations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add private company valuations via the Admin panel
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {privateValuations.map((company) => (
                    <CompanyRow
                      key={company.id}
                      name={company.company_name}
                      ticker={company.last_update}
                      price={company.valuation}
                      type="private"
                    />
                  ))}
                </div>
              )}
              {privateValuations && privateValuations.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  💰 Valuations from last funding rounds
                </p>
              )}
            </CardContent>
          </Card>
        </div>
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

// Company Row Component
interface CompanyRowProps {
  name: string;
  ticker: string;
  price: string;
  change?: string;
  marketCap?: string;
  type: 'public' | 'private';
}

const CompanyRow = ({ name, ticker, price, change, marketCap, type }: CompanyRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
    <div className="flex-1">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{ticker}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-primary">{price}</p>
      {type === 'public' && change && (
        <p className={`text-sm ${parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {parseFloat(change) >= 0 ? '+' : ''}{change}%
        </p>
      )}
      {marketCap && (
        <p className="text-xs text-muted-foreground">{marketCap}</p>
      )}
    </div>
  </div>
);

export default MarketIntelligence;
