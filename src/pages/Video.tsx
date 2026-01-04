import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaContent } from '../../types/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MediaCard from '@/components/MediaCard';
import { Button } from '@/components/ui/button';
import { Plus, Video as VideoIcon } from 'lucide-react';

const Video = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch videos from Supabase
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => getMediaContent({ media_type: 'video', published: true }),
  });

  // Get unique categories
  const categories = ['all', ...new Set(videos?.map(v => v.category).filter(Boolean) || [])];

  // Filter videos by category
  const filteredVideos = selectedCategory === 'all'
    ? videos || []
    : videos?.filter(v => v.category === selectedCategory) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container-blog py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <VideoIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Videos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore insights on AI, data engineering, and technology innovation through engaging video content.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category as string)}
              >
                {category === 'all' ? 'All Videos' : category}
              </Button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVideos.length === 0 && (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <p className="text-muted-foreground text-lg mb-6">
              No videos yet. Check back soon for content about AI, data innovation, and technology trends.
            </p>
            <Button asChild>
              <a href="/admin">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Video
              </a>
            </Button>
          </div>
        )}

        {/* Videos Grid */}
        {!isLoading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <MediaCard
                key={video.id}
                title={video.title}
                description={video.description}
                mediaType={video.media_type}
                thumbnail={video.thumbnail_url}
                duration={video.duration}
                viewCount={video.view_count}
                href={`/media/${video.slug}`}
                publishedDate={video.published_date}
                category={video.category}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Video;
