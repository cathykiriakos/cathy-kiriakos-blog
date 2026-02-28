import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Linkedin, Link, Check, Facebook } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  imageUrl?: string;
}

// Threads icon (Meta does not provide a Lucide icon; using inline SVG)
const ThreadsIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 192 192" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.678 6.925 9.98 15.716 12.853 26.119l16.147-4.308c-3.483-12.704-8.953-23.606-16.35-32.503C147.036 10.852 125.539 1.186 97.07 1H96.93C68.518 1.186 47.23 10.883 33.328 28.818 20.941 44.792 14.551 67.316 14.33 96v.06c.221 28.684 6.61 51.208 19 67.182 13.903 17.935 35.19 27.632 63.602 27.818h.14c25.28-.174 43.024-6.813 57.597-21.383 19.16-19.157 18.587-43.107 12.287-57.816-4.43-10.323-12.836-18.754-25.42-24.873ZM96.77 125.96c-10.447.576-21.256-4.102-21.82-14.173-.412-7.686 5.476-16.267 23.462-17.287a94.4 94.4 0 0 1 5.527-.162c6.185 0 11.984.605 17.271 1.783-1.969 24.48-13.842 29.274-24.44 29.839Z"/>
  </svg>
);

const SocialShare = ({ title, url = window.location.href, description = '', imageUrl }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    threads: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=500,noopener,noreferrer');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Share this article</h4>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openShare(shareLinks.linkedin)}
            className="w-full gap-2 justify-start"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openShare(shareLinks.facebook)}
            className="w-full gap-2 justify-start"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openShare(shareLinks.threads)}
            className="w-full gap-2 justify-start"
          >
            <ThreadsIcon />
            Threads
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="w-full gap-2 justify-start"
          >
            {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SocialShare;
