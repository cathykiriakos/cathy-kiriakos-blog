import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NewsItem } from '@/types/database';
import { ExternalLink, Calendar } from 'lucide-react';

interface NewsHeadlinesProps {
  newsItems: NewsItem[];
  maxItems?: number;
  autoSelect?: boolean; // If true, auto-selects top 3 by date; if false, shows manually featured items
}

const NewsHeadlines = ({ newsItems, maxItems = 3, autoSelect = false }: NewsHeadlinesProps) => {
  // Filter and select headlines based on autoSelect mode
  const selectedNews = autoSelect
    ? newsItems
        .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
        .slice(0, maxItems)
    : newsItems
        .filter(item => item.featured)
        .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
        .slice(0, maxItems);

  if (selectedNews.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">Today's Headlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {selectedNews.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 pb-6 border-b border-border last:border-0 last:pb-0 group"
            >
              {/* Image on the left */}
              {item.image_url && (
                <div className="relative overflow-hidden w-48 h-32 flex-shrink-0 rounded-md">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Content on the right */}
              <div className="flex-1 space-y-2">
                {/* Source and date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={item.published_date}>{formatDate(item.published_date)}</time>
                  </div>
                  <span>•</span>
                  <span className={`font-medium capitalize ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                </div>

                {/* Headline - bold */}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/link"
                  >
                    <h3 className="font-bold text-lg text-foreground group-hover/link:text-primary transition-colors flex items-start gap-2">
                      {item.title}
                      <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </h3>
                  </a>
                ) : (
                  <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                )}

                {/* Summary/excerpt */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {item.summary}
                </p>

                {/* Read more link if URL exists */}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Read full article
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsHeadlines;
