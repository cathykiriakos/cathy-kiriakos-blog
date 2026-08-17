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
import { PlusCircle, Newspaper, Settings, Mail, Pencil, Trash2, LayoutDashboard, BookOpen, Tag, LogOut, Share2, Linkedin, Facebook, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  createPost,
  updatePost,
  deletePost,
  createNewsItem,
  deleteNewsItem,
  getPosts,
  getNewsItems,
  getNewsletterSubscribers,
  getContactSubmissions,
  getReflections,
  createReflection,
  updateReflection,
  deleteReflection,
  getCategories,
  createCategory,
  deleteCategory,
} from '../../types/supabase';
import { POST_CATEGORIES, SENTIMENT_OPTIONS, SITE_PAGES } from '../../types/database';
import type { PostFormData, NewsFormData, ReflectionFormData, CategoryFormData } from '../../types/database';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';


type SectionKey = 'about_me' | 'my_principles' | 'reflections_on_ai' | 'my_resume';
interface HomeSection { section_key: string; content: string; title: string; }

const SECTION_KEYS: SectionKey[] = ['about_me', 'my_principles', 'reflections_on_ai', 'my_resume'];

const DEFAULT_TITLES: Record<SectionKey, string> = {
  about_me: 'About Me',
  my_principles: 'My Principles',
  reflections_on_ai: 'Reflections on AI',
  my_resume: 'Resume',
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  // ── Social Cross-Posting State ──────────────────────────────────────────────
  type SocialPlatform = 'linkedin' | 'facebook' | 'instagram' | 'threads';
  const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; icon: React.ReactNode }[] = [
    { id: 'linkedin',  label: 'LinkedIn',  icon: <Linkedin className="h-4 w-4" /> },
    { id: 'facebook',  label: 'Facebook',  icon: <Facebook className="h-4 w-4" /> },
    { id: 'instagram', label: 'Instagram', icon: <span className="text-xs font-bold">IG</span> },
    { id: 'threads',   label: 'Threads',   icon: <span className="text-xs font-bold">@</span> },
  ];
  const [socialSelectedPost, setSocialSelectedPost] = useState<string>('');
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>(['linkedin']);
  const [socialPosting, setSocialPosting] = useState(false);
  const [socialResults, setSocialResults] = useState<Record<string, { ok: boolean; error?: string }> | null>(null);

  const toggleSocialPlatform = (platform: SocialPlatform) => {
    setSocialPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSocialPost = async () => {
    if (!socialSelectedPost || socialPlatforms.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }

    const post = allPosts?.find((p) => p.id === socialSelectedPost);
    if (!post) return;

    const siteUrl = window.location.origin;
    const postUrl = `${siteUrl}/blog/${post.slug}`;

    setSocialPosting(true);
    setSocialResults(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-post`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            platforms: socialPlatforms,
            title: post.title,
            excerpt: post.excerpt || '',
            url: postUrl,
            imageUrl: post.image_url || undefined,
          }),
        }
      );

      const data = await res.json();
      setSocialResults(data.results);

      const allOk = Object.values(data.results as Record<string, { ok: boolean }>).every((r) => r.ok);
      toast({
        title: allOk ? 'Posted successfully!' : 'Some platforms failed',
        description: allOk
          ? `"${post.title}" was published to ${socialPlatforms.join(', ')}.`
          : 'Check results below for details.',
        variant: allOk ? 'default' : 'destructive',
      });
    } catch (err) {
      toast({ title: 'Network error', description: String(err), variant: 'destructive' });
    } finally {
      setSocialPosting(false);
    }
  };

  // Fetch home sections
  const { data: homeSections = [] } = useQuery<HomeSection[]>({
    queryKey: ['home_sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('section_key, content, title');
      if (error) throw error;
      return data ?? [];
    },
  });

  // Local draft state for editing home sections
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({});
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});

  // Personal Reflections draft state
  const [prTitleDraft, setPrTitleDraft] = useState('');
  const [prContentDraft, setPrContentDraft] = useState('');

  const getSectionContent = (key: string) =>
    sectionDrafts[key] ?? homeSections.find((s) => s.section_key === key)?.content ?? '';

  const getSectionTitle = (key: SectionKey) =>
    titleDrafts[key] ?? homeSections.find((s) => s.section_key === key)?.title ?? DEFAULT_TITLES[key];

  const updateSectionMutation = useMutation({
    mutationFn: async ({ key, content, title }: { key: string; content: string; title: string }) => {
      const { error } = await supabase
        .from('home_sections')
        .upsert(
          { section_key: key, content, title, updated_at: new Date().toISOString() },
          { onConflict: 'section_key' }
        );
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['home_sections'] });
      setSectionDrafts((prev) => { const next = { ...prev }; delete next[variables.key]; return next; });
      setTitleDrafts((prev) => { const next = { ...prev }; delete next[variables.key]; return next; });
      toast({ title: 'Saved!', description: 'Section updated successfully.' });
    },
    onError: (error: any) => {
      console.error('Section save error:', error);
      toast({ title: 'Error', description: 'Failed to save section.', variant: 'destructive' });
    },
  });


  // Fetch personal reflections section
  const { data: prSection } = useQuery<HomeSection | null>({
    queryKey: ['home_sections', 'personal_reflections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('section_key, content, title')
        .eq('section_key', 'personal_reflections')
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  const getPrTitle = () => prTitleDraft || prSection?.title || 'Personal Reflections';
  const getPrContent = () => prContentDraft || prSection?.content || '';

  const updatePrMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { error } = await supabase
        .from('home_sections')
        .upsert(
          { section_key: 'personal_reflections', content, title, updated_at: new Date().toISOString() },
          { onConflict: 'section_key' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_sections', 'personal_reflections'] });
      setPrTitleDraft('');
      setPrContentDraft('');
      toast({ title: 'Saved!', description: 'Personal Reflections updated successfully.' });
    },
    onError: (error: any) => {
      console.error('Personal Reflections save error:', error);
      toast({ title: 'Error', description: 'Failed to save Personal Reflections.', variant: 'destructive' });
    },
  });

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

  const { data: dbCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Derive the dropdown options: use DB categories when loaded, otherwise fall back to hardcoded
  const categoryOptions: string[] = dbCategories?.map((c) => c.name) ?? [...POST_CATEGORIES];

  // Category form state
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', page: '' });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCategoryForm({ name: '', page: '' });
      toast({ title: 'Category added!', description: 'The new category is now available when creating posts.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to add category.', variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category removed.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to remove category.', variant: 'destructive' });
    },
  });

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    createCategoryMutation.mutate(categoryForm);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Remove category "${name}"? Posts already using it will keep their category label.`)) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const { data: reflections } = useQuery({
    queryKey: ['adminReflections'],
    queryFn: () => getReflections(false),
  });

  // Reflection form state
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(null);
  const [reflectionForm, setReflectionForm] = useState<ReflectionFormData>({
    title: '',
    thought: '',
    image_url: '',
    video_url: '',
    published: true,
  });

  const createReflectionMutation = useMutation({
    mutationFn: createReflection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReflections'] });
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast({ title: 'Success!', description: 'Reflection added successfully.' });
      resetReflectionForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to add reflection.', variant: 'destructive' });
    },
  });

  const updateReflectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReflectionFormData> }) =>
      updateReflection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReflections'] });
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast({ title: 'Success!', description: 'Reflection updated successfully.' });
      resetReflectionForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update reflection.', variant: 'destructive' });
    },
  });

  const deleteReflectionMutation = useMutation({
    mutationFn: deleteReflection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReflections'] });
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast({ title: 'Deleted', description: 'Reflection removed.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete reflection.', variant: 'destructive' });
    },
  });

  const resetReflectionForm = () => {
    setEditingReflectionId(null);
    setReflectionForm({ title: '', thought: '', image_url: '', video_url: '', published: true });
  };

  const handleEditReflection = (r: any) => {
    setEditingReflectionId(r.id);
    setReflectionForm({
      title: r.title,
      thought: r.thought || '',
      image_url: r.image_url || '',
      video_url: r.video_url || '',
      published: r.published,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReflection = (id: string, title: string) => {
    if (window.confirm(`Delete reflection "${title}"?`)) {
      deleteReflectionMutation.mutate(id);
    }
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReflectionId) {
      updateReflectionMutation.mutate({ id: editingReflectionId, data: reflectionForm });
    } else {
      createReflectionMutation.mutate(reflectionForm);
    }
  };

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
    image_url: '',
    featured: false,
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
        image_url: '',
        featured: false,
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

  const deleteNewsMutation = useMutation({
    mutationFn: deleteNewsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast({ title: 'Deleted', description: 'News item removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete news item.', variant: 'destructive' });
    },
  });

  const handleDeleteNewsItem = (id: string, title: string) => {
    if (window.confirm(`Remove "${title}"?`)) {
      deleteNewsMutation.mutate(id);
    }
  };

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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage your content, track engagement, and configure settings
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="home">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="personal-reflections">
              <BookOpen className="mr-2 h-4 w-4" />
              Reflections
            </TabsTrigger>
            <TabsTrigger value="posts">
              <PlusCircle className="mr-2 h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="mr-2 h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="mr-2 h-4 w-4" />
              Social
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

          {/* Home Sections Tab */}
          <TabsContent value="home" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Home Page Sections</CardTitle>
                <CardDescription>
                  Edit the content for each section displayed on the home page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {SECTION_KEYS.map((key) => {
                  const currentTitle = getSectionTitle(key);
                  return (
                    <div key={key} className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <Label htmlFor={`title-${key}`} className="text-sm text-muted-foreground">
                          Section Title
                        </Label>
                        <Input
                          id={`title-${key}`}
                          value={currentTitle}
                          onChange={(e) =>
                            setTitleDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder="Section title (e.g. About Me, My Journey...)"
                          className="text-base font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Content</Label>
                        <RichTextEditor
                          content={getSectionContent(key)}
                          onChange={(html) =>
                            setSectionDrafts((prev) => ({ ...prev, [key]: html }))
                          }
                          placeholder={`Write your ${currentTitle} content here...`}
                        />
                      </div>
                      <Button
                        onClick={() =>
                          updateSectionMutation.mutate({
                            key,
                            content: getSectionContent(key),
                            title: currentTitle,
                          })
                        }
                        disabled={updateSectionMutation.isPending}
                        size="sm"
                      >
                        {updateSectionMutation.isPending ? 'Saving...' : `Save "${currentTitle}"`}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Personal Reflections Tab */}
          <TabsContent value="personal-reflections" className="space-y-6">
            {/* Page Title */}
            <Card>
              <CardHeader>
                <CardTitle>Page Title</CardTitle>
                <CardDescription>
                  Edit the title displayed at the top of the Personal Reflections page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="pr-title" className="text-sm text-muted-foreground">
                    Page Title
                  </Label>
                  <Input
                    id="pr-title"
                    value={getPrTitle()}
                    onChange={(e) => setPrTitleDraft(e.target.value)}
                    placeholder="e.g. Personal Reflections"
                    className="text-base font-semibold"
                  />
                </div>
                <Button
                  onClick={() =>
                    updatePrMutation.mutate({ title: getPrTitle(), content: prSection?.content || '' })
                  }
                  disabled={updatePrMutation.isPending}
                  size="sm"
                >
                  {updatePrMutation.isPending ? 'Saving...' : 'Save Title'}
                </Button>
              </CardContent>
            </Card>

            {/* Add / Edit Reflection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{editingReflectionId ? 'Edit Reflection' : 'Add New Reflection'}</CardTitle>
                    <CardDescription>
                      {editingReflectionId
                        ? 'Update this thought, image, or headline.'
                        : 'Add a thought, image, or headline to the Personal Reflections page.'}
                    </CardDescription>
                  </div>
                  {editingReflectionId && (
                    <Button type="button" variant="outline" onClick={resetReflectionForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReflectionSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="reflection-title">Headline</Label>
                    <Input
                      id="reflection-title"
                      value={reflectionForm.title}
                      onChange={(e) => setReflectionForm({ ...reflectionForm, title: e.target.value })}
                      placeholder="Enter a headline or title"
                      required
                    />
                  </div>

                  <ImageUpload
                    label="Image (optional)"
                    currentImageUrl={reflectionForm.image_url}
                    onUrlChange={(url) => setReflectionForm({ ...reflectionForm, image_url: url })}
                    showUrlInput={true}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="reflection-video">Video URL (optional)</Label>
                    <Input
                      id="reflection-video"
                      value={reflectionForm.video_url ?? ''}
                      onChange={(e) => setReflectionForm({ ...reflectionForm, video_url: e.target.value })}
                      placeholder="YouTube, Vimeo, or direct .mp4 URL"
                    />
                    <p className="text-xs text-muted-foreground">
                      If both image and video are provided, video takes priority in the display.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Thought / Caption</Label>
                    <RichTextEditor
                      content={reflectionForm.thought ?? ''}
                      onChange={(html) => setReflectionForm({ ...reflectionForm, thought: html })}
                      placeholder="Share your thought or a brief caption..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reflection-published"
                      checked={reflectionForm.published}
                      onCheckedChange={(checked) =>
                        setReflectionForm({ ...reflectionForm, published: checked })
                      }
                    />
                    <Label htmlFor="reflection-published">Publish immediately</Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createReflectionMutation.isPending || updateReflectionMutation.isPending}
                  >
                    {editingReflectionId
                      ? (updateReflectionMutation.isPending ? 'Updating...' : 'Update Reflection')
                      : (createReflectionMutation.isPending ? 'Adding...' : 'Add Reflection')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Reflections */}
            <Card>
              <CardHeader>
                <CardTitle>Reflections</CardTitle>
                <CardDescription>{reflections?.length || 0} total items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reflections?.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {r.image_url && (
                          <img
                            src={r.image_url}
                            alt={r.title}
                            className="w-14 h-14 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.title}</p>
                          {r.thought && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{r.thought}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                        {r.published ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 text-xs rounded">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                            Draft
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReflection(r)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReflection(r.id, r.title)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!reflections || reflections.length === 0) && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      No reflections yet. Add your first thought above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                          {categoryOptions.map((cat) => (
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
                    <RichTextEditor
                      content={postForm.content}
                      onChange={(html) => setPostForm({ ...postForm, content: html })}
                      placeholder="Write your post content here..."
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold">Rich Text Editor Features:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><strong>Formatting toolbar:</strong> Bold, italic, underline, headings, lists, alignment</li>
                        <li><strong>Font choices:</strong> Select different fonts from the dropdown</li>
                        <li><strong>Import Markdown:</strong> Click "Import MD" to paste Markdown content</li>
                        <li><strong>Auto-format:</strong> Click the "Auto Format" button to clean up spacing</li>
                        <li><strong>Images & Links:</strong> Use the toolbar buttons to add images and links</li>
                        <li><strong>Shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)</li>
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
                    <Label htmlFor="news-url">Article URL (optional)</Label>
                    <Input
                      id="news-url"
                      value={newsForm.url}
                      onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                      placeholder="https://example.com/article"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-image-url">Image URL (optional)</Label>
                    <Input
                      id="news-image-url"
                      value={newsForm.image_url}
                      onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Image will be displayed left-aligned in the headline section
                    </p>
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="news-featured"
                      checked={newsForm.featured}
                      onCheckedChange={(checked) =>
                        setNewsForm({ ...newsForm, featured: checked })
                      }
                    />
                    <Label htmlFor="news-featured">Feature on Market Intelligence page</Label>
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
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.source} • {new Date(item.published_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteNewsItem(item.id, item.title)}
                          disabled={deleteNewsMutation.isPending}
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

          {/* Social Publishing Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post to Social Media</CardTitle>
                <CardDescription>
                  Publish a post directly to your connected social platforms.
                  Requires API tokens set as Supabase secrets — see{' '}
                  <code className="text-xs bg-muted px-1 rounded">supabase/functions/social-post/index.ts</code>{' '}
                  for setup instructions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 — Select content */}
                <div className="space-y-2">
                  <Label>1. Select a post to share</Label>
                  <Select value={socialSelectedPost} onValueChange={setSocialSelectedPost}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a post…" />
                    </SelectTrigger>
                    <SelectContent>
                      {allPosts?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview */}
                {socialSelectedPost && (() => {
                  const p = allPosts?.find((x) => x.id === socialSelectedPost);
                  if (!p) return null;
                  return (
                    <div className="rounded-lg border p-4 bg-muted/30 space-y-1 text-sm">
                      <p className="font-semibold">{p.title}</p>
                      {p.excerpt && <p className="text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                      <p className="text-xs text-primary">{window.location.origin}/blog/{p.slug}</p>
                    </div>
                  );
                })()}

                {/* Step 2 — Select platforms */}
                <div className="space-y-3">
                  <Label>2. Select platforms</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SOCIAL_PLATFORMS.map(({ id, label, icon }) => (
                      <div
                        key={id}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          socialPlatforms.includes(id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        onClick={() => toggleSocialPlatform(id)}
                      >
                        <Checkbox
                          checked={socialPlatforms.includes(id)}
                          onCheckedChange={() => toggleSocialPlatform(id)}
                        />
                        <span className="text-muted-foreground">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instagram requires your post to have a featured image.
                  </p>
                </div>

                {/* Step 3 — Post Now */}
                <Button
                  className="w-full gap-2"
                  disabled={!socialSelectedPost || socialPlatforms.length === 0 || socialPosting}
                  onClick={handleSocialPost}
                >
                  {socialPosting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</>
                    : <><Share2 className="h-4 w-4" /> Post Now to {socialPlatforms.length === SOCIAL_PLATFORMS.length ? 'all platforms' : socialPlatforms.join(', ')}</>
                  }
                </Button>

                {/* Results */}
                {socialResults && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Results</p>
                    {Object.entries(socialResults).map(([platform, result]) => (
                      <div
                        key={platform}
                        className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                          result.ok ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950' : 'border-destructive/30 bg-destructive/5'
                        }`}
                      >
                        {result.ok
                          ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                          : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        }
                        <div>
                          <span className="font-medium capitalize">{platform}</span>
                          {!result.ok && result.error && (
                            <p className="text-xs text-destructive mt-0.5">{result.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Setup Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Setup Guide</CardTitle>
                <CardDescription>
                  One-time developer app setup required for each platform before posting will work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">linkedin.com/developers/apps</a> → Create App</li>
                    <li>Request "Share on LinkedIn" product (instant approval)</li>
                    <li>Generate token with scopes: <code className="bg-muted px-1 rounded">w_member_social</code></li>
                    <li>Set Supabase secrets: <code className="bg-muted px-1 rounded">LINKEDIN_ACCESS_TOKEN</code> and <code className="bg-muted px-1 rounded">LINKEDIN_AUTHOR_URN</code></li>
                  </ol>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook Page + Instagram + Threads</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com</a> → Create App → Business type</li>
                    <li>Add "Pages API" product → generate a Page Access Token</li>
                    <li>For Instagram: connect your IG Business account to a Facebook Page, then get the IG Account ID</li>
                    <li>For Threads: add "Threads API" product (requires app review from Meta)</li>
                    <li>Set Supabase secrets: <code className="bg-muted px-1 rounded">META_ACCESS_TOKEN</code>, <code className="bg-muted px-1 rounded">META_PAGE_ID</code>, <code className="bg-muted px-1 rounded">META_INSTAGRAM_ACCOUNT_ID</code>, <code className="bg-muted px-1 rounded">META_THREADS_USER_ID</code></li>
                  </ol>
                </div>
                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <strong>Deploy the Edge Function:</strong><br />
                  Run <code>supabase functions deploy social-post</code> from your project root after setting secrets.
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
          <TabsContent value="config" className="space-y-6">

            {/* Category Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Post Categories
                </CardTitle>
                <CardDescription>
                  Create and manage the category labels available when writing posts. Assign a page so posts
                  with that category automatically appear in that section of the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create form */}
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Category Name</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="e.g. Leadership, AI Ethics…"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-page">Appears on page</Label>
                      <Select
                        value={categoryForm.page || 'none'}
                        onValueChange={(val) => setCategoryForm({ ...categoryForm, page: val === 'none' ? null : val })}
                      >
                        <SelectTrigger id="cat-page">
                          <SelectValue placeholder="Select a page…" />
                        </SelectTrigger>
                        <SelectContent>
                          {SITE_PAGES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={createCategoryMutation.isPending}>
                    {createCategoryMutation.isPending ? 'Adding…' : 'Add Category'}
                  </Button>
                </form>

                {/* Existing categories */}
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {dbCategories?.length ?? 0} categories
                  </p>
                  {dbCategories?.map((cat) => {
                    const pageLabel = SITE_PAGES.find((p) => p.value === (cat.page ?? 'none'))?.label ?? 'All Posts only';
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{cat.name}</span>
                          <span className="ml-3 text-xs text-muted-foreground">{pageLabel}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {(!dbCategories || dbCategories.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">No categories yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
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
                    Add API keys as environment variables in your Cloudflare Worker settings or .env file.
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
