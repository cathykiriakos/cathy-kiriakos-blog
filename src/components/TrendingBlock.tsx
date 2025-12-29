import BlogCard from './BlogCard';

// TODO: Add your trending posts here or fetch from Supabase
const trendingPosts: Array<{
  title: string;
  category: string;
  date: string;
  excerpt?: string;
  image: string;
}> = [];

const TrendingBlock = () => {
  if (trendingPosts.length === 0) {
    return null; // Don't show this section if no trending posts
  }

  return (
    <section className="container-blog py-16 bg-muted/30">
      <h2 id="trending-heading" className="section-title mb-8">Trending</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trendingPosts.map((post, index) => (
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
    </section>
  );
};

export default TrendingBlock;