import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { getReflections, getCategories, getPostsByCategories } from '@/lib/supabase';
import type { Reflection, Post } from '@/types/database';

const usePageTitle = () =>
  useQuery({
    queryKey: ['home_sections', 'personal_reflections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('title')
        .eq('section_key', 'personal_reflections')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

// Unified card type for display
type CardItem =
  | { kind: 'reflection'; id: string; title: string; thought?: string; image_url?: string; created_at: string }
  | { kind: 'post'; slug: string; title: string; excerpt: string; image_url?: string; created_at: string };

const PersonalReflections = () => {
  const { data: section } = usePageTitle();

  const { data: reflectionItems, isLoading: loadingReflections } = useQuery<Reflection[]>({
    queryKey: ['reflections'],
    queryFn: () => getReflections(true),
  });

  // Dynamically fetch which categories are mapped to this page
  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const prCategoryNames = useMemo(() => {
    if (!allCategories) return null;
    const names = allCategories
      .filter((c) => c.page === 'personal-reflections')
      .map((c) => c.name);
    return names.length > 0 ? names : ['Personal Reflections']; // fallback
  }, [allCategories]);

  const { data: posts, isLoading: loadingPosts } = useQuery<Post[]>({
    queryKey: ['reflectionPosts', prCategoryNames],
    queryFn: () => getPostsByCategories(prCategoryNames!),
    enabled: prCategoryNames !== null,
  });

  const isLoading = loadingReflections || loadingPosts;
  const title = section?.title || 'Personal Reflections';

  // Merge both sources sorted newest first
  const cards = useMemo<CardItem[]>(() => {
    const fromReflections: CardItem[] = (reflectionItems ?? []).map((r) => ({
      kind: 'reflection',
      id: r.id,
      title: r.title,
      thought: r.thought,
      image_url: r.image_url,
      created_at: r.created_at,
    }));
    const fromPosts: CardItem[] = (posts ?? []).map((p) => ({
      kind: 'post',
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      image_url: p.image_url,
      created_at: p.created_at,
    }));
    return [...fromReflections, ...fromPosts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reflectionItems, posts]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        <article className="container-blog py-16">
          <header className="mb-10">
            <h1 className="font-bold text-foreground leading-tight text-5xl">{title}</h1>
          </header>

          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : cards.length === 0 ? (
            <p className="text-muted-foreground italic">
              No reflections yet. Add content from the admin panel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card) => {
                if (card.kind === 'reflection') {
                  return (
                    <div
                      key={`r-${card.id}`}
                      className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      {card.image_url && (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-5 space-y-2">
                        <h2 className="font-bold text-foreground leading-tight text-lg">{card.title}</h2>
                        {card.thought && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{card.thought}</p>
                        )}
                        <p className="text-xs text-muted-foreground/60">
                          {new Date(card.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Post card — links through to the full blog post
                return (
                  <Link
                    key={`p-${card.slug}`}
                    to={`/blog/${card.slug}`}
                    className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 block"
                  >
                    {card.image_url && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Personal Reflections
                      </span>
                      <h2 className="font-bold text-foreground leading-tight text-lg group-hover:text-black transition-colors">
                        {card.title}
                      </h2>
                      {card.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {card.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(card.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalReflections;
