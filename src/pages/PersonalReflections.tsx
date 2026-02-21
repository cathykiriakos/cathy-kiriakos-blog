import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { getReflections } from '@/lib/supabase';
import type { Reflection } from '@/types/database';

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

const useReflectionItems = () =>
  useQuery<Reflection[]>({
    queryKey: ['reflections'],
    queryFn: () => getReflections(true),
  });

const PersonalReflections = () => {
  const { data: section } = usePageTitle();
  const { data: items, isLoading } = useReflectionItems();

  const title = section?.title || 'Personal Reflections';

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
          ) : !items || items.length === 0 ? (
            <p className="text-muted-foreground italic">
              No reflections yet. Add content from the admin panel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {item.image_url && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={`p-5 space-y-2 ${!item.image_url ? 'pt-6' : ''}`}>
                    <h2 className="font-bold text-foreground leading-tight text-lg">
                      {item.title}
                    </h2>
                    {item.thought && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.thought}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalReflections;
