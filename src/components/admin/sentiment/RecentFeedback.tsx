
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSentiment } from '@/services/sentimentService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Loader2, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentFeedbackProps {
  filters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  };
}

const RecentFeedback: React.FC<RecentFeedbackProps> = ({ filters }) => {
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  
  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ['sentiment-feedback', filters],
    queryFn: () => fetchAllSentiment(filters)
  });
  
  // Debug log for filters and data
  console.log("RecentFeedback filters:", filters);
  console.log("RecentFeedback data count:", sentimentData?.length || 0);
  
  const filteredData = sentimentData 
    ? sentimentData.filter(item => {
        console.log("Processing feedback item:", item);
        if (!sentimentFilter) return true;
        return item.sentiment_label === sentimentFilter;
      })
      .filter(item => item.feedback) // Only show items with feedback
      .sort((a, b) => {
        // Sort by creation date - most recent first
        return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
      })
      .slice(0, 20) // Limit to 20 items
    : [];
  
  const getSentimentIcon = (label: string | undefined) => {
    switch(label) {
      case 'positive': return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-5 w-5 text-red-500" />;
      default: return <MessageCircle className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const getRatingEmoji = (rating: number) => {
    if (rating === 1) return "😡";
    if (rating === 2) return "😔";
    if (rating === 3) return "😐";
    if (rating === 4) return "🙂";
    return "😃";
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>
              Employee comments and sentiment analysis
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge 
              variant={sentimentFilter === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSentimentFilter(null)}
            >
              All
            </Badge>
            <Badge 
              variant={sentimentFilter === 'positive' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                sentimentFilter !== 'positive' && "bg-transparent hover:bg-transparent text-green-600 hover:text-green-700 border-green-200"
              )}
              onClick={() => setSentimentFilter('positive')}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Positive
            </Badge>
            <Badge 
              variant={sentimentFilter === 'neutral' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                sentimentFilter !== 'neutral' && "bg-transparent hover:bg-transparent text-yellow-600 hover:text-yellow-700 border-yellow-200"
              )}
              onClick={() => setSentimentFilter('neutral')}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Neutral
            </Badge>
            <Badge 
              variant={sentimentFilter === 'negative' ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                sentimentFilter !== 'negative' && "bg-transparent hover:bg-transparent text-red-600 hover:text-red-700 border-red-200"
              )}
              onClick={() => setSentimentFilter('negative')}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              Negative
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feedback data available for the selected filters.
            {filters.city && <p className="mt-2">Filtering by city: {filters.city}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="text-3xl">{getRatingEmoji(item.rating)}</div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getSentimentIcon(item.sentiment_label)}
                        <span className="ml-2 font-medium">
                          {item.city || 'Unknown'} 
                          {item.cluster ? ` - ${item.cluster}` : ''}
                        </span>
                        {item.role && (
                          <span className="ml-2 text-gray-500">
                            ({item.role})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.created_at && format(parseISO(item.created_at), 'PPp')}
                      </div>
                    </div>
                    <p className="mt-2">{item.feedback}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFeedback;
