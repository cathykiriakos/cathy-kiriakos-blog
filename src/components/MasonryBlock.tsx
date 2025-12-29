import { useState } from 'react';

// TODO: Add your featured stories here or fetch from Supabase
const masonryPosts: Array<{
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
  height: 'tall' | 'medium' | 'short';
}> = [];

const MasonryBlock = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getHeightClass = (height: string) => {
    switch (height) {
      case 'tall':
        return 'row-span-3';
      case 'medium':
        return 'row-span-2';
      case 'short':
        return 'row-span-1';
      default:
        return 'row-span-2';
    }
  };

  // Ensure even number of items
  const displayPosts = masonryPosts.length % 2 === 0
    ? masonryPosts
    : masonryPosts.slice(0, -1);

  if (displayPosts.length === 0) {
    return null; // Don't show this section if no featured stories
  }

  return (
    <section className="container-blog py-16">
      <h2 id="masonry-heading" className="section-title mb-8">Featured Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[180px]" style={{ gridAutoFlow: 'row dense' }}>
        {displayPosts.map((post, index) => (
          <article
            key={index}
            className={`group cursor-pointer ${getHeightClass(post.height)} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-card border border-border">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width="294"
                height={post.height === 'tall' ? '540' : post.height === 'medium' ? '360' : '180'}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 294px"
                style={{ minHeight: '100%', maxHeight: '100%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-primary/80 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs opacity-80">{post.date}</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-2 line-clamp-2">
                  {post.title}
                </h3>
                {hoveredIndex === index && post.excerpt && (
                  <p className="text-xs opacity-90 line-clamp-2 transition-opacity duration-300">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MasonryBlock;