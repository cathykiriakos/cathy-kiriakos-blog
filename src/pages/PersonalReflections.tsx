import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const usePersonalReflections = () =>
  useQuery({
    queryKey: ['home_sections', 'personal_reflections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('section_key, content, title')
        .eq('section_key', 'personal_reflections')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

const PersonalReflections = () => {
  const { data: section, isLoading } = usePersonalReflections();

  const title = section?.title || 'Personal Reflections';
  const content = section?.content || '';

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
          ) : content ? (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none text-base text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-muted-foreground italic">
              No content yet. Add content from the admin panel.
            </p>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalReflections;
