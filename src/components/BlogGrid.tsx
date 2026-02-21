import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/supabase';
import type { Post as DbPost } from '@/types/database';
import BlogCard from './BlogCard';

const BlogGrid = () => {
  // Fetch published posts from Supabase
  const { data: dbPosts, isLoading } = useQuery<DbPost[]>({
    queryKey: ['blogGridPosts'],
    queryFn: () => getPosts({ published: true }),
  });

  // Map database posts to component format with fallback image
  const blogPosts = useMemo(() => {
    if (!dbPosts) return [];

    return dbPosts.map(post => ({
      title: post.title,
      category: post.category,
      date: new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      excerpt: post.excerpt,
      image: post.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // Tech/AI placeholder
      slug: post.slug,
    }));
  }, [dbPosts]);

  return (
    <section className="container-blog py-16">
      <h2 id="all-posts-heading" className="section-title mb-8">All Posts</h2>
      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No posts yet. Visit the <a href="/admin" className="text-primary hover:underline">Admin panel</a> to add your first post.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {blogPosts.map((post, index) => (
            <BlogCard
              key={post.slug}
              title={post.title}
              category={post.category}
              date={post.date}
              excerpt={post.excerpt}
              image={post.image}
              href={`/blog/${post.slug}`}
              layout="horizontal"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogGrid;