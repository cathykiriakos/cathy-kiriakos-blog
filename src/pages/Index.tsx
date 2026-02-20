import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogGrid from '@/components/BlogGrid';
import HomeSections from '@/components/HomeSections';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        <div className="container-blog py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 items-start">
            {/* Left: Profile Image */}
            <div className="lg:sticky lg:top-24">
              <img
                src={heroImage}
                alt="Cathy Kiriakos"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            {/* Right: About Me and following sections */}
            <div>
              <HomeSections />
            </div>
          </div>
        </div>
        <section aria-labelledby="all-posts-heading">
          <BlogGrid />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
