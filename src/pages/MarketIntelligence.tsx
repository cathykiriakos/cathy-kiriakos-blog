// src/pages/MarketIntelligence.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Cpu, BarChart3 } from 'lucide-react';
import { getLatestMarketData, getPrivateValuations, getNewsItems } from '../../types/supabase';
import type { NewsItem } from '../../types/database';
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

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: ['marketData'],
    queryFn: getLatestMarketData,
  });

  // Fetch private valuations
  const { data: privateValuations } = useQuery({
    queryKey: ['privateValuations'],
    queryFn: getPrivateValuations,
  });

  // Fetch news items
  const { data: newsItems } = useQuery({
    queryKey: ['newsItems'],
    queryFn: () => getNewsItems(10),
  });

  // Mock chart data (replace with real aggregated data)
  const chartData = [
    { month: 'Jul', aiMarketCap: 8000, chipMarketCap: 3000, sentiment: 65 },
    { month: 'Aug', aiMarketCap: 8500, chipMarketCap: 3300, sentiment: 67 },
    { month: 'Sep', aiMarketCap: 8900, chipMarketCap: 3500, sentiment: 70 },
    { month: 'Oct', aiMarketCap: 9400, chipMarketCap: 3800, sentiment: 72 },
    { month: 'Nov', aiMarketCap: 9800, chipMarketCap: 4100, sentiment: 75 },
    { month: 'Dec', aiMarketCap: 10200, chipMarketCap: 4300, sentiment: 77 },
  ];

  // Public companies to track
  const publicCompanies = [
    { name: 'NVIDIA', ticker: 'NVDA', type: 'chip' },
    { name: 'Microsoft', ticker: 'MSFT', type: 'ai' },
    { name: 'Google/Alphabet', ticker: 'GOOGL', type: 'ai' },
    { name: 'Meta', ticker: 'META', type: 'ai' },
    { name: 'Amazon', ticker: 'AMZN', type: 'ai' },
    { name: 'AMD', ticker: 'AMD', type: 'chip' },
    { name: 'Intel', ticker: 'INTC', type: 'chip' },
    { name: 'TSMC', ticker: 'TSM', type: 'chip' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container-blog py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Market Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Real-time tracking of the AI revolution. We're not witnessing hype—we're living through 
            the biggest market disruption since the Industrial Revolution. The data tells the story.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            title="AI Companies Market Cap"
            value="$10.2T"
            change="+12.3%"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Chip Makers Market Cap"
            value="$4.3T"
            change="+8.7%"
            trend="up"
            icon={<Cpu className="h-5 w-5" />}
          />
          <MetricCard
            title="Market Sentiment"
            value="77%"
            change="Strong Positive"
            trend="up"
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </div>

        {/* Market Trends Chart */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Market Cap Trends (Last 6 Months)</CardTitle>
            <CardDescription>
              Tracking the exponential growth of AI and semiconductor companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
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
                  <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {activeView === 'trend' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
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
              <div className="space-y-4">
                {newsItems?.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Trackers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Public Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Public AI & Chip Companies</CardTitle>
              <CardDescription>Real-time market data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {publicCompanies.map((company, idx) => (
                  <CompanyRow
                    key={idx}
                    name={company.name}
                    ticker={company.ticker}
                    price="$XXX.XX"
                    change="+X.X%"
                    type="public"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                📊 Data updates every 5 minutes via Alpha Vantage API
              </p>
            </CardContent>
          </Card>

          {/* Private Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Private AI Labs & Startups</CardTitle>
              <CardDescription>Last reported valuations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {privateValuations?.map((company) => (
                  <CompanyRow
                    key={company.id}
                    name={company.company_name}
                    ticker={company.last_update}
                    price={company.valuation}
                    type="private"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💰 Valuations from last funding rounds
              </p>
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
      <h4 className="font-semibold flex-1">{item.title}</h4>
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
  type: 'public' | 'private';
}

const CompanyRow = ({ name, ticker, price, change, type }: CompanyRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{ticker}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-primary">{price}</p>
      {change && type === 'public' && (
        <p className="text-sm text-green-500">{change}</p>
      )}
    </div>
  </div>
);

export default MarketIntelligence;
