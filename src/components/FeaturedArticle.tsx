import heroImage from '@/assets/hero-image.jpg';
import { Button } from '@/components/ui/button';

interface FeaturedArticleProps {
  title: string;
  author: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
}

const FeaturedArticle = ({
  title,
  author,
  category,
  date,
  excerpt,
  image
}: FeaturedArticleProps) => {
  return (
    <article className="container-blog py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <img
            src={image}
            alt={`Featured article: ${title} - A professional image related to ${category.toLowerCase()}`}
            className="object-cover object-top w-full h-full transition-transform duration-700 hover:scale-105"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width="592"
            height="444"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 592px"
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="featured-title">
              {title}
            </h1>
            {category === 'INTRODUCTION' && (
              <p className="text-xl text-muted-foreground mt-2 italic">
                Solving the Dismal Science of "Partially Baked" Pipelines
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <span className="blog-meta">{author} / WRITER</span>
            <span className="text-muted-foreground" aria-hidden="true">—</span>
            <span className="blog-meta">{category}</span>
            <span className="text-muted-foreground" aria-hidden="true">—</span>
            <time className="blog-meta" dateTime="2023-09-02">{date}</time>
          </div>

          {category === 'INTRODUCTION' ? (
            <div className="text-base text-muted-foreground leading-relaxed space-y-4">
              {typeof excerpt === 'string' ? (
                excerpt.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                excerpt
              )}
            </div>
          ) : (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
          )}
          
          {category !== 'INTRODUCTION' && (
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href="/blog/self-driving-cars-everything-you-need-to-know"
                  aria-label={`Read more about: ${title}`}
                >
                  READ MORE
                  <span className="ml-2" aria-hidden="true">→</span>
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// Default Featured Article
export const DefaultFeaturedArticle = () => (
  <FeaturedArticle
    title="NI! New Innovation.... or just a silly place"
    author="Cathy Kiriakos"
    category="INTRODUCTION"
    date="Oak Park, IL"
    excerpt={`I'm an infinitely curious builder, a former economics student, and a resident of Oak Park, Illinois—a neighborhood where we take Halloween very seriously. Every year, my yard transforms into a tribute to Monty Python and the Holy Grail, complete with the Knights Who Say "Ni!"

But in my professional life as a Data Engineering Manager, I found myself facing a different kind of absurdity. I watched as external consultants delivered expensive data pipelines without asking the imperative questions—missing the "shrubbery" of non-functional requirements like partitioning, archiving, and bad-source management.

I grew tired of the "partially baked" delivery model, so I built a mechanism to fix it.

Enter: NiData

NiData is my solution to the friction of modern data engineering. It's an agentic orchestration framework designed for the Databricks Unity Catalog that captures 26 tables of metadata to ensure a use case is fully understood before a single line of code is moved to production.

Instead of a stressed-out delivery manager, NiData deploys an Agentic Army:

• The Base Agent: Grounded in organizational context.
• The Architect Agent: Automatically summoning Mermaid diagrams for the ingestion flow.
• The Engineer Agent: Generating DDL scripts with precision.
• The QA Agent: Building end-to-end testing scripts to ensure "none shall pass" with broken data.

Why this blog?

With the current pace of AI innovation, I've found a new inspiration to optimize the "painful processes" that hold businesses back. As someone who looks at the world through an economic lens, I'm obsessed with how AI is evolving our economy and the way we build.

This blog is my notebook at the intersection of human curiosity, agentic orchestration, and the search for the Holy Grail of scalable data.

Welcome to NiData. We promise the data will be better than our British accents.`}
    image={heroImage}
  />
);

export default FeaturedArticle;