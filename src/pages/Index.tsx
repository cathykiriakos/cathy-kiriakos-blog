import Header from '@/components/Header';
import Footer from '@/components/Footer';
import heroImage from '@/assets/hero-image.jpg';
import EditorsPick from '@/components/EditorsPick';
import TrendingBlock from '@/components/TrendingBlock';
import MasonryBlock from '@/components/MasonryBlock';
import BlogGrid from '@/components/BlogGrid';
import HomeSections from '@/components/HomeSections';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        <article className="container-blog py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={heroImage}
                alt="Cathy Kiriakos"
                className="object-cover object-top w-full h-full transition-transform duration-700 hover:scale-105"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width="592"
                height="888"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 592px"
              />
            </div>
            <HomeSections />
          </div>
        </article>
        <section aria-labelledby="editors-pick-heading">
          <EditorsPick />
        </section>
        <section aria-labelledby="trending-heading">
          <TrendingBlock />
        </section>
        <section aria-labelledby="masonry-heading">
          <MasonryBlock />
        </section>
        <section aria-labelledby="all-posts-heading">
          <BlogGrid />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
