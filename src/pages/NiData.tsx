import Header from '@/components/Header';
import Footer from '@/components/Footer';
import knightImage from '@/assets/nidata-knight.png';

const NiData = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        <article className="container-blog py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Knight Image only */}
            <div className="space-y-6">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={knightImage}
                  alt="NiData Knight - The guardian of data pipelines"
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  width="592"
                  height="592"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h1 className="featured-title">
                  Ni! New Innovation: automating the data SDLC process with Agentic AI
                </h1>
                <p className="text-xl text-muted-foreground mt-2 italic">
                  Solving the Dismal Science of "Partially Baked" Pipelines
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="blog-meta">Cathy Kiriakos / WRITER</span>
                <span className="text-muted-foreground" aria-hidden="true">—</span>
                <span className="blog-meta">INTRODUCTION</span>
                <span className="text-muted-foreground" aria-hidden="true">—</span>
                <time className="blog-meta">Oak Park, IL</time>
              </div>

              <div className="text-base text-muted-foreground leading-relaxed space-y-4">
                <p>I'm an infinitely curious builder, a former economics student, and a resident of Oak Park, Illinois—a neighborhood where we take Halloween very seriously. Every year, my yard transforms into a tribute to Monty Python and the Holy Grail, complete with the Knights Who Say "Ni!"</p>
                <p>But in my professional life as a Data Engineering Manager, I found myself facing a different kind of absurdity. I watched as external consultants delivered expensive data pipelines without asking the imperative questions—missing the "shrubbery" of non-functional requirements like partitioning, archiving, and bad-source management.</p>
                <p>I grew tired of the "partially baked" delivery model, so I built a mechanism to fix it.</p>
                <p>Enter: NiData</p>
                <p>NiData is my solution to the friction of modern data engineering. It's an agentic orchestration framework designed for the Databricks Unity Catalog that captures 26 tables of metadata to ensure a use case is fully understood before a single line of code is moved to production.</p>
                <p>Instead of a stressed-out delivery manager, NiData deploys an Agentic Army:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The Base Agent: Grounded in organizational context.</li>
                  <li>The Architect Agent: Automatically summoning Mermaid diagrams for the ingestion flow.</li>
                  <li>The Engineer Agent: Generating DDL scripts with precision.</li>
                  <li>The QA Agent: Building end-to-end testing scripts to ensure "none shall pass" with broken data.</li>
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* Pitchbook Embed */}
        <section className="container-blog py-8">
          <h2 className="text-2xl font-bold mb-6">NiData Pitchbook</h2>
          <div className="w-full rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: '85vh', minHeight: '600px' }}>
            <iframe
              src="/pitchbook.html"
              title="NiData Pitchbook"
              className="w-full h-full"
              style={{ border: 'none' }}
              loading="lazy"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NiData;
