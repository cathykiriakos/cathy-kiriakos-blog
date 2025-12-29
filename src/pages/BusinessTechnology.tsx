import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPosts } from '@/lib/supabase';
import type { Post } from '@/types/database';
import { Search, Filter, Plus } from 'lucide-react';

const BusinessTechnology = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch posts from Supabase (filtered by business & technology category)
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['businessTechPosts', categoryFilter],
    queryFn: () => getPosts({
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      published: true
    }),
  });

  // Filter posts by search query
  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container-blog py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Business & Technology
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Exploring the intersection of business strategy, technology innovation, and data-driven insights.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="AI & Data">AI & Data</SelectItem>
                  <SelectItem value="Innovation">Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-2">⚠️ Error loading articles</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Articles Yet</CardTitle>
              <CardDescription>
                This section is ready for your business and technology insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">
                  Start sharing your thoughts on business strategy, technology trends, and innovation.
                </p>
                <Button asChild>
                  <a href="/admin">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Article
                  </a>
                </Button>
              </div>

              {/* Placeholder for what content will look like */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold mb-4">Article Topics You Can Explore:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Digital transformation strategies</li>
                    <li>• AI implementation in business</li>
                    <li>• Data-driven decision making</li>
                    <li>• Technology stack evaluations</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• Cloud infrastructure insights</li>
                    <li>• Product development methodologies</li>
                    <li>• Tech industry analysis</li>
                    <li>• Innovation case studies</li>
                  </ul>
                </div>
              </div>

              {/* Quick Commentary Section */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold mb-4">Quick Commentary</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share brief insights, observations, or commentary on current tech and business topics.
                </p>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "Use the Admin panel to publish longer articles or quick commentary pieces.
                    Your insights on Ni Data's development, data orchestration, and industry trends will appear here."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  category={post.category || 'Uncategorized'}
                  date={new Date(post.created_at).toLocaleDateString()}
                  excerpt={post.excerpt}
                  image={post.featured_image || '/placeholder.svg'}
                />
              ))}
            </div>

            {/* Show count */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BusinessTechnology;
