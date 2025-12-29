import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Calendar, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container-blog py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Ni Enterprises
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              New Innovation - Keeping pulse on Tech and AI innovation
            </p>
          </div>

          {/* Hero Section */}
          <div className="mb-16">
            <div className="aspect-video rounded-lg bg-muted mb-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground">Author Photo Placeholder</p>
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Welcome to <strong>Ni Enterprises</strong> - New Innovation. This platform serves as a mechanism
                  to keep pulse on Tech and AI innovation while tracking the development of groundbreaking projects
                  that are reshaping how we work with data.
                </p>
                <p>
                  At the heart of Ni Enterprises is <strong>Ni Data</strong>, an agent orchestration platform designed
                  to revolutionize the traditional SDLC (Software Development Life Cycle) process for data delivery.
                  Instead of the conventional waterfall or agile approaches, Ni Data provides an end-to-end agentic
                  tool that automates and orchestrates data use case capture, development, and delivery of data products.
                </p>
                <p>
                  Through this blog, I document my journey building Ni Data, share insights on AI and data
                  orchestration, analyze market trends in the tech industry, and explore innovations that are
                  defining the future of data-driven enterprise solutions.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">What We Cover</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">AI Market Intelligence & Trends</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Ni Data Platform Development Journey</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Agent Orchestration & Data Automation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Technology Innovation & Analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Data Product Delivery & SDLC Transformation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4">About Me</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Building Ni Data since 2024</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Chicago, IL</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Data Innovator & Tech Enthusiast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Follow the Ni Data Journey
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Stay updated on the development of Ni Data and explore insights on AI, data orchestration,
              and technology innovation. Join me as we revolutionize data delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/market-intelligence">View Market Intelligence</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/business-technology">Read Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;