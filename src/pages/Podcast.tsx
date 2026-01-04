import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaContent } from '../../types/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MediaCard from '@/components/MediaCard';
import { Button } from '@/components/ui/button';
import { Plus, Mic } from 'lucide-react';

const Podcast = () => {
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');

  // Fetch podcasts from Supabase
  const { data: podcasts, isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => getMediaContent({ media_type: 'podcast', published: true }),
  });

  // Get unique seasons
  const seasons = ['all', ...new Set(podcasts?.map(p => p.season).filter(Boolean).sort((a, b) => (b || 0) - (a || 0)) || [])];

  // Filter podcasts by season
  const filteredPodcasts = selectedSeason === 'all'
    ? podcasts || []
    : podcasts?.filter(p => p.season === selectedSeason) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container-blog py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Podcast
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Engaging conversations with thought leaders, innovators, and creators shaping our world today.
          </p>
        </div>

        {/* Season Filter */}
        {seasons.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {seasons.map((season) => (
              <Button
                key={season}
                variant={selectedSeason === season ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeason(season as number | 'all')}
              >
                {season === 'all' ? 'All Episodes' : `Season ${season}`}
              </Button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading episodes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPodcasts.length === 0 && (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <p className="text-muted-foreground text-lg mb-6">
              No podcast episodes yet. Check back soon for conversations about AI, data innovation, and technology trends.
            </p>
            <Button asChild>
              <a href="/admin">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Episode
              </a>
            </Button>
          </div>
        )}

        {/* Podcasts Grid */}
        {!isLoading && filteredPodcasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPodcasts.map((podcast) => (
              <MediaCard
                key={podcast.id}
                title={podcast.title}
                description={podcast.description}
                mediaType={podcast.media_type}
                thumbnail={podcast.thumbnail_url}
                duration={podcast.duration}
                episodeNumber={podcast.episode_number}
                season={podcast.season}
                viewCount={podcast.view_count}
                href={`/media/${podcast.slug}`}
                publishedDate={podcast.published_date}
                category={podcast.category}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Podcast;