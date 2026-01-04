import { Play, Mic, Music, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MediaCardProps {
  title: string;
  description?: string;
  mediaType: 'video' | 'podcast' | 'audio';
  thumbnail?: string;
  duration?: number;
  episodeNumber?: number;
  season?: number;
  viewCount?: number;
  href: string;
  publishedDate?: string;
  category?: string;
}

const MediaCard = ({
  title,
  description,
  mediaType,
  thumbnail,
  duration,
  episodeNumber,
  season,
  viewCount,
  href,
  publishedDate,
  category
}: MediaCardProps) => {
  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get icon based on media type
  const getMediaIcon = () => {
    switch (mediaType) {
      case 'video':
        return <Play className="h-6 w-6" />;
      case 'podcast':
        return <Mic className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      default:
        return <Play className="h-6 w-6" />;
    }
  };

  const formattedDuration = formatDuration(duration);
  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <a href={href} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg border-border h-full">
        {/* Thumbnail with Play Overlay */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              {getMediaIcon()}
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-full p-4">
              {getMediaIcon()}
            </div>
          </div>

          {/* Duration Badge */}
          {formattedDuration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formattedDuration}
            </div>
          )}

          {/* Episode Badge (for podcasts) */}
          {episodeNumber && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
              {season ? `S${season}` : ''}E{episodeNumber}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {category && (
            <p className="text-xs font-medium text-primary uppercase mb-2">
              {category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {formattedDate && (
              <span>{formattedDate}</span>
            )}

            {viewCount !== undefined && viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {viewCount.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

export default MediaCard;
