import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import PageFilter, { Post } from '@/components/PageFilter';
import { useState } from 'react';
import businessPost from '@/assets/business-post.jpg';
import techPost from '@/assets/tech-post.jpg';
import workLifestyle from '@/assets/work-lifestyle.jpg';

const Innovation = () => {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const innovationPosts: Post[] = [
    // Technology Posts
    {
      title: "The Rise of Artificial Intelligence in Everyday Life",
      category: "TECHNOLOGY",
      subcategory: "Artificial Intelligence",
      date: "September 18, 2025",
      excerpt: "Exploring how AI is transforming industries and reshaping our daily experiences.",
      image: techPost,
      slug: "ai-everyday-life",
      tags: ["AI", "Machine Learning", "Daily Tech"]
    },
    {
      title: "Blockchain Beyond Cryptocurrency: Real-World Applications",
      category: "TECHNOLOGY",
      subcategory: "Blockchain",
      date: "September 12, 2025",
      excerpt: "Discovering innovative uses of blockchain technology across various sectors.",
      image: workLifestyle,
      slug: "blockchain-real-world-applications",
      tags: ["Blockchain", "Innovation", "Real-world Applications"]
    },
    {
      title: "The Future of Web Development: Trends to Watch in 2024",
      category: "TECHNOLOGY",
      subcategory: "Web Development",
      date: "September 8, 2025",
      excerpt: "Key technologies and frameworks shaping the next generation of web applications.",
      image: techPost,
      slug: "web-development-trends-2024",
      tags: ["Web Development", "Frontend", "Future Trends"]
    },
    {
      title: "Cybersecurity Best Practices for Small Businesses",
      category: "TECHNOLOGY",
      subcategory: "Cybersecurity",
      date: "September 5, 2025",
      excerpt: "Essential security measures every small business should implement to protect their data.",
      image: workLifestyle,
      slug: "cybersecurity-small-business",
      tags: ["Cybersecurity", "Small Business", "Data Protection"]
    },
    {
      title: "The Evolution of Mobile App Development",
      category: "TECHNOLOGY",
      subcategory: "Mobile Development",
      date: "August 30, 2025",
      excerpt: "From native to cross-platform: how mobile development approaches have transformed.",
      image: techPost,
      slug: "mobile-app-development-evolution",
      tags: ["Mobile Development", "Cross-platform", "App Development"]
    },
    {
      title: "Cloud Computing: Choosing the Right Solution for Your Business",
      category: "TECHNOLOGY",
      subcategory: "Cloud Computing",
      date: "August 26, 2025",
      excerpt: "A comprehensive guide to selecting the perfect cloud infrastructure for your needs.",
      image: workLifestyle,
      slug: "cloud-computing-business-guide",
      tags: ["Cloud Computing", "Infrastructure", "Business Solutions"]
    },
    // Business Posts
    {
      title: "Sustainable Business Practices for Modern Entrepreneurs",
      category: "BUSINESS",
      subcategory: "Sustainability",
      date: "September 15, 2025",
      excerpt: "Learn how to build a sustainable business that benefits both profit and planet.",
      image: businessPost,
      slug: "sustainable-business-practices",
      tags: ["Sustainability", "Green Business", "Entrepreneurship"]
    },
    {
      title: "The Future of Remote Work: Trends and Predictions",
      category: "BUSINESS",
      subcategory: "Future of Work",
      date: "September 10, 2025",
      excerpt: "Analyzing the evolution of remote work and what lies ahead.",
      image: workLifestyle,
      slug: "future-remote-work",
      tags: ["Remote Work", "Future Trends", "Digital Workplace"]
    },
    {
      title: "Building a Personal Brand in the Digital Age",
      category: "BUSINESS",
      subcategory: "Personal Branding",
      date: "September 3, 2025",
      excerpt: "Essential strategies for creating and maintaining your online presence.",
      image: businessPost,
      slug: "personal-brand-digital-age",
      tags: ["Personal Branding", "Digital Marketing", "Online Presence"]
    },
    {
      title: "Digital Marketing Strategies That Actually Work",
      category: "BUSINESS",
      subcategory: "Digital Marketing",
      date: "August 28, 2025",
      excerpt: "Proven digital marketing tactics to grow your business in today's competitive landscape.",
      image: workLifestyle,
      slug: "digital-marketing-strategies",
      tags: ["Digital Marketing", "Growth Strategies", "Online Marketing"]
    },
    {
      title: "Leadership in Times of Change",
      category: "BUSINESS",
      subcategory: "Leadership",
      date: "August 25, 2025",
      excerpt: "How effective leaders navigate uncertainty and drive organizational success.",
      image: businessPost,
      slug: "leadership-times-change",
      tags: ["Leadership", "Change Management", "Business Strategy"]
    },
    {
      title: "The Economics of Startup Growth",
      category: "BUSINESS",
      subcategory: "Startup Growth",
      date: "August 22, 2025",
      excerpt: "Understanding the financial dynamics that drive successful startup scaling.",
      image: workLifestyle,
      slug: "economics-startup-growth",
      tags: ["Startups", "Growth Economics", "Business Finance"]
    }
  ];

  const postsToShow = filteredPosts.length > 0 ? filteredPosts : innovationPosts;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container-blog py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Innovation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the intersection of business and technology. Discover insights on digital transformation, entrepreneurship, emerging technologies, and innovative business strategies.
          </p>
        </div>

        <PageFilter
          posts={innovationPosts}
          onFilteredPostsChange={setFilteredPosts}
          availableCategories={["TECHNOLOGY", "BUSINESS"]}
          showCategoryFilter={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </main>
      <Footer />
    </div>
  );
};

export default Innovation;