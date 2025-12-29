import BlogCard from './BlogCard';

// TODO: Replace this empty array with your actual blog posts
// You can add posts manually here or fetch them from Supabase
// Each post should have: title, category, date, excerpt (optional), image
const blogPosts: Array<{
  title: string;
  category: string;
  date: string;
  excerpt?: string;
  image: string;
}> = [];

const BlogGrid = () => {
  return (
    <section className="container-blog py-16">
      <h2 id="all-posts-heading" className="section-title mb-8">All Posts</h2>
      {blogPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No posts yet. Visit the <a href="/admin" className="text-primary hover:underline">Admin panel</a> to add your first post.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <BlogCard
              key={index}
              title={post.title}
              category={post.category}
              date={post.date}
              excerpt={index < 3 ? post.excerpt : undefined}
              image={post.image}
              isSmall={index >= 3}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogGrid;