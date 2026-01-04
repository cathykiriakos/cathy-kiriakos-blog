import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMediaBySlug, incrementViewCount } from '../../types/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MediaPlayer from '@/components/MediaPlayer';
import SocialShare from '@/components/SocialShare';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Eye, Tag } from 'lucide-react';
import { useEffect } from 'react';

const MediaDetail = () => {
  const { slug } = useParams();

  // Fetch media from Supabase
  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media', slug],
    queryFn: () => getMediaBySlug(slug!),
    enabled: !!slug,
  });

  // Increment view count when media loads
  useEffect(() => {
    if (media?.id) {
      incrementViewCount(media.id);
    }
  }, [media?.id]);

  // Format duration from seconds to readable format
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  const formattedDate = media?.published_date
    ? new Date(media.published_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const duration = formatDuration(media?.duration);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="container-blog py-16">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="container-blog py-16">
          <div className="text-center py-16 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Media Not Found</h1>
            <p className="text-muted-foreground mb-8">
              This {media?.media_type || 'media'} could not be found. It may have been removed or the URL is incorrect.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <a href="/video">Browse Videos</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/podcast">Browse Podcasts</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="container-blog py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {/* Category & Episode Info */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {media.category && (
                <span className="text-xs font-medium text-primary uppercase">
                  {media.category}
                </span>
              )}
              {media.episode_number && (
                <span className="text-xs font-medium text-muted-foreground">
                  {media.season ? `Season ${media.season}, ` : ''}Episode {media.episode_number}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              {media.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
              {formattedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
              )}

              {duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
              )}

              {media.view_count > 0 && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{media.view_count.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Media Player */}
          <div className="mb-8">
            <MediaPlayer
              mediaType={media.media_type}
              hostingType={media.hosting_type}
              embedUrl={media.embed_url}
              mediaUrl={media.media_url}
              thumbnail={media.thumbnail_url}
              transcript={media.transcript}
              title={media.title}
            />
          </div>

          {/* Share Buttons */}
          <div className="mb-8 flex justify-between items-center">
            <SocialShare
              title={media.title}
              description={media.description || ''}
            />

            {/* Tags */}
            {media.tags && media.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {media.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {media.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {media.description}
              </p>
            </div>
          )}

          {/* Show Notes */}
          {media.show_notes && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {media.media_type === 'video' ? 'Description' : 'Show Notes'}
              </h2>
              <div
                className="prose prose-lg max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: media.show_notes }}
              />
            </div>
          )}

          {/* More Episodes Link */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <Button asChild size="lg">
              <a href={media.media_type === 'video' ? '/video' : '/podcast'}>
                Browse More {media.media_type === 'video' ? 'Videos' : 'Episodes'}
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default MediaDetail;
