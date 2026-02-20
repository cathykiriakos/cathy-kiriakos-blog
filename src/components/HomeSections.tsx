import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type SectionKey = 'about_me' | 'my_principles' | 'reflections_on_ai' | 'my_resume';

interface HomeSectionData {
  section_key: string;
  content: string;
}

const useHomeSections = () =>
  useQuery<HomeSectionData[]>({
    queryKey: ['home_sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('section_key, content');
      if (error) throw error;
      return data ?? [];
    },
  });

const getContent = (sections: HomeSectionData[], key: SectionKey) =>
  sections.find((s) => s.section_key === key)?.content ?? '';

const SectionBlock = ({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string;
}) => (
  <section id={id} className="mb-10">
    <h2 className="text-5xl font-bold text-foreground leading-tight mb-4">{title}</h2>
    <div
      className="prose prose-neutral dark:prose-invert max-w-none text-base text-muted-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </section>
);

const HomeSections = () => {
  const { data: sections = [], isLoading } = useHomeSections();

  if (isLoading) return null;

  return (
    <>
      <SectionBlock
        id="about-me"
        title="About Me"
        content={getContent(sections, 'about_me')}
      />
      <SectionBlock
        id="my-principles"
        title="My Principles"
        content={getContent(sections, 'my_principles')}
      />
      <SectionBlock
        id="reflections-on-ai"
        title="Reflections on AI"
        content={getContent(sections, 'reflections_on_ai')}
      />
      <SectionBlock
        id="my-resume"
        title="My Resume"
        content={getContent(sections, 'my_resume')}
      />
    </>
  );
};

export default HomeSections;
