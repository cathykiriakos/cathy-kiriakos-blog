// src/App.tsx
// UPDATED VERSION - Replace your existing App.tsx with this

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SkipLink from "@/components/SkipLink";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";

// Lazy load non-critical pages
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const AllPosts = lazy(() => import("./pages/AllPosts"));
const Innovation = lazy(() => import("./pages/Innovation"));
const Podcast = lazy(() => import("./pages/Podcast"));
const Video = lazy(() => import("./pages/Video"));
const MediaDetail = lazy(() => import("./pages/MediaDetail"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// NEW PAGES
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const BusinessTechnology = lazy(() => import("./pages/BusinessTechnology.tsx"));
const TestSupabase = lazy(() => import("./pages/TestSupabase.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <SkipLink />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/posts" element={<AllPosts />} />
              <Route path="/innovation" element={<Innovation />} />
              <Route path="/podcast" element={<Podcast />} />
              <Route path="/video" element={<Video />} />

              {/* NEW ROUTES */}
              <Route path="/market-intelligence" element={<MarketIntelligence />} />
              <Route path="/business-technology" element={<BusinessTechnology />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/test-supabase" element={<TestSupabase />} />

              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/media/:slug" element={<MediaDetail />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
