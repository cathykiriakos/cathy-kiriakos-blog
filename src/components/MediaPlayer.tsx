import { useState } from 'react';
import { Play, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaPlayerProps {
  mediaType: 'video' | 'podcast' | 'audio';
  hostingType: 'youtube' | 'vimeo' | 'spotify' | 'soundcloud' | 'self-hosted';
  embedUrl?: string;
  mediaUrl?: string;
  thumbnail?: string;
  transcript?: string;
  title: string;
}

const MediaPlayer = ({
  mediaType,
  hostingType,
  embedUrl,
  mediaUrl,
  thumbnail,
  transcript,
  title
}: MediaPlayerProps) => {
  const [showTranscript, setShowTranscript] = useState(false);

  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  // Extract Vimeo ID from URL
  const getVimeoEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/vimeo\.com\/(\d+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://player.vimeo.com/video/${videoIdMatch[1]}`;
    }
    return url;
  };

  // Extract Spotify show/episode ID from URL
  const getSpotifyEmbedUrl = (url: string) => {
    // Handle both show and episode URLs
    const match = url.match(/spotify\.com\/(show|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
    }
    return url;
  };

  // Get the proper embed URL based on hosting type
  const getEmbedUrl = () => {
    if (!embedUrl) return '';

    switch (hostingType) {
      case 'youtube':
        return getYouTubeEmbedUrl(embedUrl);
      case 'vimeo':
        return getVimeoEmbedUrl(embedUrl);
      case 'spotify':
        return getSpotifyEmbedUrl(embedUrl);
      case 'soundcloud':
        // SoundCloud typically provides embed codes directly
        return embedUrl;
      default:
        return embedUrl;
    }
  };

  const finalEmbedUrl = getEmbedUrl();

  // Render YouTube player
  const renderYouTubePlayer = () => (
    <div className="aspect-video w-full">
      <iframe
        src={finalEmbedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      />
    </div>
  );

  // Render Vimeo player
  const renderVimeoPlayer = () => (
    <div className="aspect-video w-full">
      <iframe
        src={finalEmbedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      />
    </div>
  );

  // Render Spotify player
  const renderSpotifyPlayer = () => (
    <div className="w-full" style={{ height: '232px' }}>
      <iframe
        src={finalEmbedUrl}
        title={title}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full h-full rounded-lg"
      />
    </div>
  );

  // Render SoundCloud player
  const renderSoundCloudPlayer = () => (
    <div className="w-full" style={{ height: '166px' }}>
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={finalEmbedUrl}
        title={title}
        className="rounded-lg"
      />
    </div>
  );

  // Render self-hosted player
  const renderSelfHostedPlayer = () => {
    if (mediaType === 'video') {
      return (
        <video
          controls
          className="w-full aspect-video rounded-lg"
          poster={thumbnail}
        >
          <source src={mediaUrl} />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <audio controls className="w-full rounded-lg">
          <source src={mediaUrl} />
          Your browser does not support the audio tag.
        </audio>
      );
    }
  };

  // Render the appropriate player
  const renderPlayer = () => {
    switch (hostingType) {
      case 'youtube':
        return renderYouTubePlayer();
      case 'vimeo':
        return renderVimeoPlayer();
      case 'spotify':
        return renderSpotifyPlayer();
      case 'soundcloud':
        return renderSoundCloudPlayer();
      case 'self-hosted':
        return renderSelfHostedPlayer();
      default:
        return (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Media player not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Media Player */}
      <div className="media-player">
        {renderPlayer()}
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {transcript && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {showTranscript ? 'Hide' : 'Show'} Transcript
          </Button>
        )}

        {mediaUrl && hostingType === 'self-hosted' && (
          <Button variant="outline" size="sm" asChild>
            <a href={mediaUrl} download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        )}
      </div>

      {/* Transcript */}
      {transcript && showTranscript && (
        <div className="bg-muted/50 rounded-lg p-6 mt-4">
          <h3 className="text-lg font-semibold mb-4">Transcript</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;
