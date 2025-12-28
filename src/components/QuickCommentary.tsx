// src/components/QuickCommentary.tsx
// Quick commentary feature for adding thoughts to news items

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { NewsItem } from '@/types/database';

interface QuickCommentaryProps {
  newsItem: NewsItem;
  onCommentAdded?: () => void;
}

export const QuickCommentary = ({ newsItem, onCommentAdded }: QuickCommentaryProps) => {
  const [commentary, setCommentary] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentaryMutation = useMutation({
    mutationFn: async (comment: string) => {
      // Update the news item with commentary
      const { data, error } = await supabase
        .from('news_items')
        .update({ 
          commentary: comment,
          commentary_added_at: new Date().toISOString()
        })
        .eq('id', newsItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsItems'] });
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast({
        title: 'Commentary added!',
        description: 'Your thoughts have been saved.',
      });
      setCommentary('');
      setIsExpanded(false);
      onCommentAdded?.();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add commentary. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!commentary.trim()) return;
    addCommentaryMutation.mutate(commentary);
  };

  return (
    <div className="mt-3">
      {!isExpanded ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Your Commentary
        </Button>
      ) : (
        <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/50">
          <Textarea
            placeholder="Share your thoughts on this story... Why does it matter? What's the bigger picture?"
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setCommentary('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!commentary.trim() || addCommentaryMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {addCommentaryMutation.isPending ? 'Saving...' : 'Save Commentary'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to display existing commentary
interface CommentaryDisplayProps {
  commentary: string;
  author?: string;
  addedAt?: string;
}

export const CommentaryDisplay = ({ commentary, author = 'Cathy', addedAt }: CommentaryDisplayProps) => (
  <div className="mt-3 p-3 bg-primary/5 border-l-4 border-primary rounded-r-lg">
    <div className="flex items-start gap-3">
      <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-primary mb-1">{author}'s Take:</p>
        <p className="text-sm leading-relaxed">{commentary}</p>
        {addedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(addedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  </div>
);