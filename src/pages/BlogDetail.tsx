import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { marked } from 'marked';
import { useQuery } from '@tanstack/react-query';
import { getPostBySlug } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SocialShare from '@/components/SocialShare';
import ReadingProgress from '@/components/ReadingProgress';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import BackToTop from '@/components/BackToTop';

const BlogDetail = () => {
  const { slug } = useParams();

  // Fetch post from Supabase
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="container-blog py-16">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="container-blog py-16">
          <div className="text-center py-16 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              This blog post could not be found. It may have been removed or the URL is incorrect.
            </p>
            <Button asChild>
              <a href="/posts">View All Posts</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Calculate read time (roughly 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Convert Markdown content to HTML when content appears to be Markdown.
  // If content already contains HTML tags, render as-is.
  // Preserves line breaks and spacing for plain text.
  const contentHtml = useMemo(() => {
    if (!post || !post.content) return '';
    const content = post.content;

    // Check if content contains HTML tags
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);
    if (looksLikeHtml) return content;

    // Check if content appears to use markdown syntax
    const hasMarkdown = /^#{1,6}\s|^\*\*|^__|\[.*\]\(.*\)|^\* |^\- |^\d+\. |^> /m.test(content);

    if (hasMarkdown) {
      // Parse as markdown
      return marked.parse(content || '');
    } else {
      // Plain text: preserve line breaks
      // Convert double line breaks to paragraphs
      // Convert single line breaks to <br> tags
      const paragraphs = content.split('\n\n');
      const htmlContent = paragraphs
        .map(para => {
          const withBreaks = para.replace(/\n/g, '<br>');
          return `<p>${withBreaks}</p>`;
        })
        .join('');
      return htmlContent;
    }
  }, [post?.content]);

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Header />
      
      <main id="main-content" className="container-blog py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article>
              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-muted-foreground">{post.category}</span>
                  <span className="text-muted-foreground text-xs">—</span>
                  <time className="text-xs text-muted-foreground" dateTime={post.created_at}>{formattedDate}</time>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">{post.author?.charAt(0) || 'C'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author || 'Cathy Kiriakos'}</p>
                      <p className="text-xs text-muted-foreground">{readTime} min read</p>
                    </div>
                  </div>

                  <SocialShare
                    title={post.title}
                    description={post.excerpt}
                  />
                </div>
              </header>

              {/* Hero Image */}
              {post.image_url && (
                <div className="mb-8">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full aspect-[16/10] object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none text-foreground article-content prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-ul:text-muted-foreground prose-li:text-muted-foreground prose-img:rounded-lg prose-img:my-6 prose-strong:text-foreground"
                data-article-content
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </article>

            {/* Related Posts Section - can be enhanced later with actual related posts */}
            <section className="mt-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Posts</h2>
              <p className="text-muted-foreground">Check out our latest posts in <a href="/posts" className="text-primary hover:underline">All Posts</a></p>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Table of Contents */}
            <TableOfContents content={post.content} />

            {/* Newsletter Signup */}
            <div className="bg-black text-white p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-sm mb-4 opacity-90">
                Subscribe to our newsletter to get our newest articles instantly!
              </p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-white text-black border-0"
                />
                <Button variant="outline" className="w-full bg-white text-black hover:bg-gray-100">
                  SIGNUP
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">Categories</h3>
              <div className="space-y-3">
                {['AI Innovation', 'Culture', 'Management', 'Data Engineering', 'NiData Journey'].map((category) => (
                  <a
                    key={category}
                    href="/posts"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BlogDetail;