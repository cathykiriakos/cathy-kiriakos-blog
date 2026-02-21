import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type SectionKey = 'about_me' | 'my_principles' | 'reflections_on_ai' | 'my_resume';

interface HomeSectionData {
  section_key: string;
  content: string;
  title: string;
}

const DEFAULT_TITLES: Record<SectionKey, string> = {
  about_me: 'About Me',
  my_principles: 'My Principles',
  reflections_on_ai: 'Reflections on AI',
  my_resume: 'Resume',
};

const SECTION_IDS: Record<SectionKey, string> = {
  about_me: 'about-me',
  my_principles: 'my-principles',
  reflections_on_ai: 'reflections-on-ai',
  my_resume: 'my-resume',
};

const useHomeSections = () =>
  useQuery<HomeSectionData[]>({
    queryKey: ['home_sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('section_key, content, title');
      if (error) return [];
      return data ?? [];
    },
  });

const SectionBlock = ({ id, title, content }: { id: string; title: string; content: string }) => (
  <section id={id} className="mb-10">
    <h2 className="font-bold text-foreground leading-tight mb-4 text-4xl">{title}</h2>
    <div
      className="prose prose-neutral dark:prose-invert max-w-none text-base text-muted-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </section>
);

const SECTION_ORDER: SectionKey[] = ['about_me', 'my_principles', 'reflections_on_ai', 'my_resume'];

const HomeSections = () => {
  const { data: sections = [], isLoading } = useHomeSections();

  if (isLoading) return null;

  return (
    <>
      {SECTION_ORDER.map((key) => {
        const section = sections.find((s) => s.section_key === key);
        const title = section?.title || DEFAULT_TITLES[key];
        const content = section?.content ?? '';
        return (
          <SectionBlock
            key={key}
            id={SECTION_IDS[key]}
            title={title}
            content={content}
          />
        );
      })}
    </>
  );
};

export default HomeSections;
