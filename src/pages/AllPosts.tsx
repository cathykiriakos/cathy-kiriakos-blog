import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import PageFilter, { Post } from '@/components/PageFilter';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AllPosts = () => {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // Fetch published posts from Supabase
  const { data: blogPosts, isLoading, error } = useQuery({
    queryKey: ['allPosts'],
    queryFn: () => getPosts({ published: true }),
  });

  const postsToShow = filteredPosts.length > 0 ? filteredPosts : (blogPosts || []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container-blog py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            All Posts
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete collection of articles covering technology, business, and lifestyle topics.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">Error loading posts</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : !blogPosts || blogPosts.length === 0 ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <p className="text-muted-foreground text-lg mb-6">
              No posts yet. Start creating content to share your insights on AI, data, and technology!
            </p>
            <Button asChild>
              <a href="/admin">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </a>
            </Button>
          </div>
        ) : (
          <>
            <PageFilter
              posts={blogPosts}
              onFilteredPostsChange={setFilteredPosts}
              availableCategories={["TECHNOLOGY", "BUSINESS", "LIFESTYLE", "AI", "DATA"]}
              showCategoryFilter={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {postsToShow.map((post) => (
                <BlogCard
                  key={post.slug}
                  title={post.title}
                  category={post.category}
                  date={post.date}
                  excerpt={post.excerpt}
                  image={post.image}
                  href={`/blog/${post.slug}`}
                  isSmall={false}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllPosts;