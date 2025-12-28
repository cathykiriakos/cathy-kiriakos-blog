import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlogCard from '@/components/BlogCard';
import SocialShare from '@/components/SocialShare';
import ReadingProgress from '@/components/ReadingProgress';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import BackToTop from '@/components/BackToTop';
import techPost from '@/assets/tech-post.jpg';
import businessPost from '@/assets/business-post.jpg';
import lifestylePost from '@/assets/lifestyle-post.jpg';
import workLifestyle from '@/assets/work-lifestyle.jpg';

const blogPosts = {
  "self-driving-cars-everything-you-need-to-know": {
    title: "Self-Driving Cars: Everything You Need to Know",
    category: "TECHNOLOGY",
    date: "SEP 12, 2023",
    readTime: "7 min read",
    author: "NEXUS",
    authorAvatar: "/placeholder-avatar.jpg",
    heroImage: techPost,
    content: `
      <p>The automotive industry is experiencing a revolutionary transformation with the advent of self-driving cars. This technology promises to reshape how we think about transportation, safety, and urban planning.</p>
      
      <p>From Tesla's Autopilot to Waymo's fully autonomous vehicles, the race to develop reliable self-driving technology has accelerated dramatically in recent years. But what exactly are self-driving cars, and how close are we to seeing them on every street?</p>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">The Five Levels of Autonomous Driving</h2>
      
      <p>The Society of Automotive Engineers (SAE) has defined five levels of driving automation, ranging from no automation to full automation:</p>
      
      <ul class="list-disc pl-6 my-4">
        <li><strong>Level 0:</strong> No automation - human driver controls everything</li>
        <li><strong>Level 1:</strong> Driver assistance - features like cruise control</li>
        <li><strong>Level 2:</strong> Partial automation - car can steer and accelerate/brake</li>
        <li><strong>Level 3:</strong> Conditional automation - car handles most driving tasks</li>
        <li><strong>Level 4:</strong> High automation - car can handle all driving in specific conditions</li>
        <li><strong>Level 5:</strong> Full automation - car can drive anywhere, anytime</li>
      </ul>
      
      <img src="/src/assets/tech-post.jpg" alt="Self-driving car sensors and technology" class="w-full rounded-lg my-6" />
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">The Technology Behind Autonomous Vehicles</h2>
      
      <p>Self-driving cars rely on a combination of sophisticated technologies to navigate safely. These include LiDAR sensors for 3D mapping, cameras for visual recognition, radar for object detection, and advanced AI algorithms for decision-making.</p>
      
      <p>Machine learning plays a crucial role, as these vehicles must process enormous amounts of data in real-time to make split-second decisions about steering, braking, and acceleration.</p>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">Benefits and Challenges</h2>
      
      <p>The potential benefits of autonomous vehicles are significant: reduced traffic accidents, improved mobility for disabled individuals, and more efficient traffic flow. However, challenges remain in terms of regulatory approval, public acceptance, and technical reliability in complex urban environments.</p>
      
      <p>As we move forward, the integration of self-driving cars into our transportation infrastructure will require careful consideration of safety, ethics, and societal impact.</p>
    `
  },
  "the-importance-of-corporate-social-responsibility": {
    title: "The Importance of Corporate Social Responsibility",
    category: "BUSINESS",
    date: "SEP 10, 2023",
    readTime: "6 min read",
    author: "NEXUS",
    authorAvatar: "/placeholder-avatar.jpg",
    heroImage: businessPost,
    content: `
      <p>In today's interconnected world, businesses are increasingly expected to operate with a sense of social responsibility that extends beyond profit maximization. Corporate Social Responsibility (CSR) has evolved from a nice-to-have initiative to a business imperative.</p>
      
      <p>Companies that embrace CSR are finding that it not only benefits society and the environment but also enhances their brand reputation, employee satisfaction, and long-term financial performance.</p>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">What is Corporate Social Responsibility?</h2>
      
      <p>CSR refers to a company's commitment to conducting business in an ethical manner that considers the social, environmental, and economic impact of its operations. It involves taking responsibility for the company's effects on society and the environment.</p>
      
      <img src="/src/assets/business-post.jpg" alt="Corporate responsibility meeting" class="w-full rounded-lg my-6" />
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">Key Areas of CSR</h2>
      
      <p>Modern CSR programs typically focus on four main areas:</p>
      
        <ul class="list-disc pl-6 my-4">
          <li><strong>Environmental Responsibility:</strong> Reducing carbon footprint, waste management, sustainable sourcing</li>
          <li><strong>Social Responsibility:</strong> Fair labor practices, community development, diversity and inclusion</li>
          <li><strong>Economic Responsibility:</strong> Fair business practices, supporting local economies, transparent reporting</li>
          <li><strong>Philanthropic Responsibility:</strong> Charitable giving, volunteer programs, community partnerships</li>
        </ul>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">The Business Case for CSR</h2>
      
      <p>Research consistently shows that companies with strong CSR programs outperform their peers in multiple areas. They attract and retain top talent, build stronger customer loyalty, and often enjoy better financial performance over the long term.</p>
      
      <p>Moreover, consumers increasingly prefer to do business with companies that share their values, making CSR a competitive advantage in today's market.</p>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">Implementing Effective CSR Strategies</h2>
      
      <p>Successful CSR programs require genuine commitment from leadership, clear goals and metrics, stakeholder engagement, and transparent reporting. Companies must avoid "greenwashing" and ensure their CSR efforts are authentic and impactful.</p>
      
      <p>As we face global challenges like climate change and social inequality, the role of businesses in driving positive change has never been more important. CSR is no longer optional – it's essential for sustainable business success.</p>
    `
  },
  "mindful-living-finding-balance-in-a-busy-world": {
    title: "Mindful Living: Finding Balance in a Busy World",
    category: "LIFESTYLE",
    date: "SEP 8, 2023",
    readTime: "4 min read",
    author: "MELVILLE",
    authorAvatar: "/placeholder-avatar.jpg",
    heroImage: lifestylePost,
    content: `
      <p>In our fast-paced world, finding moments of peace and balance has become more challenging than ever. The constant buzz of notifications, endless to-do lists, and societal pressures can leave us feeling overwhelmed and disconnected from what truly matters.</p>
      
      <p>Mindful living offers a path to reclaim our sense of balance and well-being. It's about being present in the moment, making conscious choices, and cultivating a deeper awareness of our thoughts, feelings, and surroundings.</p>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">What is Mindful Living?</h2>
      
      <p>Mindful living is the practice of bringing conscious awareness to our daily activities and experiences. It involves slowing down, paying attention, and making intentional choices rather than operating on autopilot.</p>
      
      <img src="/src/assets/lifestyle-post.jpg" alt="Person practicing mindfulness in nature" class="w-full rounded-lg my-6" />
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">Simple Ways to Practice Mindfulness</h2>
      
      <p>Incorporating mindfulness into your daily routine doesn't require dramatic lifestyle changes. Here are some simple practices to get started:</p>
      
        <ul class="list-disc pl-6 my-4">
          <li><strong>Morning Rituals:</strong> Start your day with five minutes of deep breathing or meditation</li>
          <li><strong>Mindful Eating:</strong> Pay attention to the taste, texture, and aroma of your food</li>
          <li><strong>Digital Detox:</strong> Set aside specific times each day to disconnect from technology</li>
          <li><strong>Nature Connection:</strong> Spend time outdoors and observe the natural world around you</li>
          <li><strong>Gratitude Practice:</strong> Reflect on three things you're grateful for each day</li>
        </ul>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">The Benefits of Mindful Living</h2>
      
      <p>Research has shown that mindfulness practices can reduce stress, improve mental clarity, enhance emotional regulation, and boost overall well-being. People who practice mindful living often report feeling more content, focused, and resilient in the face of challenges.</p>
      
      <h2 class="text-xl font-bold text-foreground mb-4 mt-8">Creating Your Personal Balance</h2>
      
      <p>Remember that mindful living looks different for everyone. The key is to find practices that resonate with you and fit into your lifestyle. Start small, be consistent, and be patient with yourself as you develop these new habits.</p>
      
      <p>In a world that often values busyness over well-being, choosing to live mindfully is a radical act of self-care and consciousness.</p>
    `
  },
  // Add more blog posts as needed
  "default": {
    title: "Blog Post Not Found",
    category: "GENERAL",
    date: "SEP 15, 2023",
    readTime: "3 min read",
    author: "NEXUS",
    authorAvatar: "/placeholder-avatar.jpg",
    heroImage: businessPost,
    content: `<p>This blog post could not be found. Please check the URL or return to the homepage.</p>`
  }
};

const popularPosts = [
  {
    title: "The Importance of Corporate Social Responsibility",
    category: "BUSINESS",
    date: "SEP 12, 2023",
    image: businessPost
  },
  {
    title: "Self-Driving Cars: Everything You Need to Know",
    category: "TECHNOLOGY",
    date: "SEP 6, 2023", 
    image: techPost
  }
];

// Create all posts data for RelatedPosts component
const allPosts = [
  {
    slug: "self-driving-cars-everything-you-need-to-know",
    title: "Self-Driving Cars: Everything You Need to Know",
    category: "TECHNOLOGY", 
    date: "SEP 12, 2023",
    readTime: "7 min read",
    image: techPost,
    excerpt: "The automotive industry is experiencing a revolutionary transformation with the advent of self-driving cars."
  },
  {
    slug: "the-importance-of-corporate-social-responsibility",
    title: "The Importance of Corporate Social Responsibility",
    category: "BUSINESS",
    date: "SEP 10, 2023", 
    readTime: "6 min read",
    image: businessPost,
    excerpt: "Businesses are increasingly expected to operate with a sense of social responsibility that extends beyond profit maximization."
  },
  {
    slug: "mindful-living-finding-balance-in-a-busy-world",
    title: "Mindful Living: Finding Balance in a Busy World",
    category: "LIFESTYLE",
    date: "SEP 8, 2023",
    readTime: "4 min read", 
    image: lifestylePost,
    excerpt: "In our fast-paced world, finding moments of peace and balance has become more challenging than ever."
  },
];

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogPosts[slug as keyof typeof blogPosts] || blogPosts.default;

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
                  <time className="text-xs text-muted-foreground" dateTime="2023-09-15">{post.date}</time>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">{post.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.readTime}</p>
                    </div>
                  </div>
                  
                  <SocialShare 
                    title={post.title}
                    description={`Read "${post.title}" on Nexus Blog`}
                  />
                </div>
              </header>

              {/* Hero Image */}
              <div className="mb-8">
                <img
                  src={post.heroImage}
                  alt={post.title}
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none text-foreground article-content
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:text-muted-foreground prose-li:text-muted-foreground
                  prose-img:rounded-lg prose-img:my-6"
                data-article-content
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Related Posts */}
            <section className="mt-16 pt-8 border-t border-border">
              <RelatedPosts
                currentPost={{ category: post.category, title: post.title }}
                allPosts={allPosts}
                maxPosts={3}
              />
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

            {/* Popular Posts */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-6">Popular Posts</h3>
              <div className="space-y-6">
                {popularPosts.map((popularPost, index) => (
                  <article key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={popularPost.image}
                        alt={popularPost.title}
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">{popularPost.category}</span>
                        <span className="text-muted-foreground text-xs">—</span>
                        <time className="text-xs text-muted-foreground">{popularPost.date}</time>
                      </div>
                      <h4 className="text-sm font-medium text-foreground leading-tight">
                        {popularPost.title}
                      </h4>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-6">Categories</h3>
              <div className="space-y-3">
                {['Technology', 'Business', 'Lifestyle'].map((category) => (
                  <a
                    key={category}
                    href={`/${category.toLowerCase()}`}
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