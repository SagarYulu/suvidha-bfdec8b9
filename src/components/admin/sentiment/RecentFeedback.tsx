
import React, { useState, useEffect } from 'react';
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
  
  const { data: sentimentData, isLoading, refetch } = useQuery({
    queryKey: ['sentiment-feedback', filters],
    queryFn: () => fetchAllSentiment(filters),
    staleTime: 30000, // 30 seconds
  });
  
  // Debug log for filters and data
  useEffect(() => {
    console.log("RecentFeedback filters:", JSON.stringify(filters, null, 2));
    console.log("RecentFeedback data count:", sentimentData?.length || 0);
    if (sentimentData?.length) {
      console.log("Sample data:", sentimentData[0]);
    }
  }, [filters, sentimentData]);
  
  // Force refetch when filters change
  useEffect(() => {
    console.log("RecentFeedback filters changed, refetching...");
    refetch();
  }, [filters, refetch]);
  
  const filteredData = sentimentData 
    ? sentimentData
      .filter(item => {
        // Apply sentiment filter if set
        if (!sentimentFilter) return true;
        
        const sentiment = item.sentiment_label?.toLowerCase() || '';
        // Handle variations of sentiment labels
        if (sentimentFilter === 'positive') {
          return sentiment.includes('positive');
        } else if (sentimentFilter === 'negative') {
          return sentiment.includes('negative');
        } else {
          return sentiment === sentimentFilter;
        }
      })
      .sort((a, b) => {
        // Sort by creation date - most recent first
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 20) // Limit to 20 items
    : [];
  
  // Separate items with feedback from those without
  const itemsWithFeedback = filteredData.filter(item => item.feedback && item.feedback.trim() !== '');
  const itemsWithoutFeedback = filteredData.filter(item => !item.feedback || item.feedback.trim() === '');
  
  // Combine the lists, prioritizing items with feedback
  const displayData = [...itemsWithFeedback, ...itemsWithoutFeedback].slice(0, 20);
  
  const getSentimentIcon = (label: string | undefined) => {
    if (!label) return <MessageCircle className="h-5 w-5 text-yellow-500" />;
    
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('positive')) {
      return <ThumbsUp className="h-5 w-5 text-green-500" />;
    } else if (lowerLabel.includes('negative')) {
      return <ThumbsDown className="h-5 w-5 text-red-500" />;
    } else {
      return <MessageCircle className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const getRatingEmoji = (rating: number) => {
    if (rating === 1) return "😡";
    if (rating === 2) return "😔";
    if (rating === 3) return "😐";
    if (rating === 4) return "🙂";
    return "😃";
  };
  
  // Debug - print active filters
  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.city) activeFilters.push(`City: ${filters.city}`);
    if (filters.cluster) activeFilters.push(`Cluster: ${filters.cluster}`);
    if (filters.role) activeFilters.push(`Role: ${filters.role}`);
    if (filters.startDate) activeFilters.push(`From: ${filters.startDate}`);
    if (filters.endDate) activeFilters.push(`To: ${filters.endDate}`);
    
    return activeFilters.length > 0 
      ? `Filtering by ${activeFilters.join(', ')}`
      : 'No filters applied';
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
        {/* Add filter status indicator */}
        <div className="mb-4 text-sm text-gray-500">
          {getActiveFiltersText()}{sentimentFilter ? `, Sentiment: ${sentimentFilter}` : ''}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !sentimentData || sentimentData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No sentiment data available for the current filters.</p>
            <p className="mt-2">Try clearing some filters or submitting feedback.</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No feedback available matching the current filters.</p>
            <p className="mt-2">Try selecting a different sentiment type or clearing filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayData.map((item) => (
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
                    {item.feedback ? (
                      <p className="mt-2">{item.feedback}</p>
                    ) : (
                      <p className="mt-2 text-gray-400 italic">No feedback text provided</p>
                    )}
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
