// src/pages/Admin.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Newspaper, Settings, Mail, Pencil, Trash2 } from 'lucide-react';
import {
  createPost,
  updatePost,
  deletePost,
  createNewsItem,
  getPosts,
  getNewsItems,
  getNewsletterSubscribers,
  getContactSubmissions
} from '../../types/supabase';
import { POST_CATEGORIES, SENTIMENT_OPTIONS } from '../../types/database';
import type { PostFormData, NewsFormData } from '../../types/database';
import ImageUpload from '@/components/ImageUpload';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: allPosts } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => getPosts({ published: undefined }),
  });

  const { data: newsItems } = useQuery({
    queryKey: ['adminNews'],
    queryFn: () => getNewsItems(20),
  });

  const { data: subscribers } = useQuery({
    queryKey: ['subscribers'],
    queryFn: getNewsletterSubscribers,
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContactSubmissions,
  });

  // Form states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<PostFormData>({
    title: '',
    category: POST_CATEGORIES[0],
    excerpt: '',
    content: '',
    image_url: '',
    published: false,
    featured: false,
  });

  const [newsForm, setNewsForm] = useState<NewsFormData>({
    title: '',
    source: '',
    sentiment: 'positive',
    summary: '',
    url: '',
    published_date: new Date().toISOString().split('T')[0],
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogGridPosts'] });
      toast({
        title: 'Success!',
        description: 'Blog post created successfully.',
      });
      resetPostForm();
    },
    onError: (error: any) => {
      console.error('Post creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post. Please check console for details.',
        variant: 'destructive',
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PostFormData> }) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogGridPosts'] });
      toast({
        title: 'Success!',
        description: 'Blog post updated successfully.',
      });
      resetPostForm();
    },
    onError: (error: any) => {
      console.error('Post update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update post. Please check console for details.',
        variant: 'destructive',
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogGridPosts'] });
      toast({
        title: 'Success!',
        description: 'Blog post deleted successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Post deletion error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post.',
        variant: 'destructive',
      });
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: createNewsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast({
        title: 'Success!',
        description: 'News item created successfully.',
      });
      setNewsForm({
        title: '',
        source: '',
        sentiment: 'positive',
        summary: '',
        url: '',
        published_date: new Date().toISOString().split('T')[0],
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create news item. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetPostForm = () => {
    setEditingPostId(null);
    setPostForm({
      title: '',
      category: POST_CATEGORIES[0],
      excerpt: '',
      content: '',
      image_url: '',
      published: false,
      featured: false,
    });
  };

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url || '',
      published: post.published,
      featured: post.featured,
    });
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePost = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePostMutation.mutate(id);
    }
  };

  // Handlers
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPostId) {
      updatePostMutation.mutate({ id: editingPostId, data: postForm });
    } else {
      createPostMutation.mutate(postForm);
    }
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNewsMutation.mutate(newsForm);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container-blog py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage your content, track engagement, and configure settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">
              <PlusCircle className="mr-2 h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="mr-2 h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              <Mail className="mr-2 h-4 w-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="mr-2 h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Create Post Tab */}
          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{editingPostId ? 'Edit Post' : 'Create New Post'}</CardTitle>
                    <CardDescription>
                      {editingPostId ? 'Update your blog post' : 'Write and publish blog posts to your site'}
                    </CardDescription>
                  </div>
                  {editingPostId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetPostForm}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        placeholder="Enter post title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={postForm.category}
                        onValueChange={(value) => setPostForm({ ...postForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POST_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <ImageUpload
                    label="Featured Image (optional)"
                    currentImageUrl={postForm.image_url}
                    onUrlChange={(url) => setPostForm({ ...postForm, image_url: url })}
                    showUrlInput={true}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      placeholder="Brief summary of the post"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      placeholder="Write your post content here..."
                      rows={12}
                      required
                      className="font-mono"
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold">Formatting Tips:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><strong>Line breaks are preserved:</strong> Press Enter once for a line break, twice for a new paragraph</li>
                        <li><strong>Markdown supported:</strong> Use # for headings, **bold**, *italic*, [link](url)</li>
                        <li><strong>Images:</strong> Upload images above, then copy URL and use ![alt text](image-url) to embed</li>
                        <li><strong>Lists:</strong> Start lines with * or - for bullets, 1. for numbered lists</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={postForm.published}
                        onCheckedChange={(checked) =>
                          setPostForm({ ...postForm, published: checked })
                        }
                      />
                      <Label htmlFor="published">Publish immediately</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={postForm.featured}
                        onCheckedChange={(checked) =>
                          setPostForm({ ...postForm, featured: checked })
                        }
                      />
                      <Label htmlFor="featured">Feature on homepage</Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {editingPostId
                      ? (updatePostMutation.isPending ? 'Updating...' : 'Update Post')
                      : (createPostMutation.isPending ? 'Creating...' : 'Create Post')
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>
                  {allPosts?.length || 0} total posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allPosts?.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{post.title || '(No title)'}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.category} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {post.published && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 text-xs rounded">
                            Published
                          </span>
                        )}
                        {post.featured && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                            Featured
                          </span>
                        )}
                        {!post.published && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                            Draft
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create News Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add News Item</CardTitle>
                <CardDescription>
                  Curate daily tech news and AI developments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="news-title">Title</Label>
                      <Input
                        id="news-title"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                        placeholder="News headline"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Input
                        id="source"
                        value={newsForm.source}
                        onChange={(e) => setNewsForm({ ...newsForm, source: e.target.value })}
                        placeholder="e.g., TechCrunch, NPR"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sentiment">Sentiment</Label>
                      <Select
                        value={newsForm.sentiment}
                        onValueChange={(value: any) =>
                          setNewsForm({ ...newsForm, sentiment: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SENTIMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="published_date">Date</Label>
                      <Input
                        id="published_date"
                        type="date"
                        value={newsForm.published_date}
                        onChange={(e) =>
                          setNewsForm({ ...newsForm, published_date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-url">URL (optional)</Label>
                    <Input
                      id="news-url"
                      value={newsForm.url}
                      onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                      placeholder="https://example.com/article"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                      placeholder="Brief summary of the news"
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createNewsMutation.isPending}
                  >
                    {createNewsMutation.isPending ? 'Adding...' : 'Add News Item'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent News */}
            <Card>
              <CardHeader>
                <CardTitle>Recent News Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {newsItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.source} • {new Date(item.published_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
                <CardDescription>
                  {subscribers?.length || 0} active subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subscribers?.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <span>{sub.email}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Submissions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
                <CardDescription>
                  {contacts?.length || 0} messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts?.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 border border-border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{contact.name}</p>
                        <span className="text-sm text-muted-foreground">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      <p className="text-sm">{contact.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Set up API keys for real-time data integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Required API Keys:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      <strong>Alpha Vantage:</strong> Stock market data -{' '}
                      <a
                        href="https://www.alphavantage.co/support/#api-key"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Get free key
                      </a>
                    </li>
                    <li>
                      <strong>NewsAPI:</strong> Tech news aggregation -{' '}
                      <a
                        href="https://newsapi.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Get free key
                      </a>
                    </li>
                    <li>
                      <strong>NYT API:</strong> Quality news content -{' '}
                      <a
                        href="https://developer.nytimes.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Get key
                      </a>
                    </li>
                    <li>
                      <strong>NPR API:</strong> NPR stories -{' '}
                      <a
                        href="https://www.npr.org/api/inputAPIKey.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Get key
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Add API keys as environment variables in your Lovable project settings or .env file.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
