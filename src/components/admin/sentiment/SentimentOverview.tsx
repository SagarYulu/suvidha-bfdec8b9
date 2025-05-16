
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSentiment } from '@/services/sentimentService';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

// Import our reusable chart components
import MoodTrendChart from '@/components/charts/MoodTrendChart';
import SentimentPieChart from '@/components/charts/SentimentPieChart';
import TopicRadarChart from '@/components/charts/TopicRadarChart';
import TopicBarChart from '@/components/charts/TopicBarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface SentimentOverviewProps {
  filters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  };
}

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ filters }) => {
  const { data: sentimentData, isLoading, refetch } = useQuery({
    queryKey: ['sentiment', filters],
    queryFn: () => fetchAllSentiment(filters),
    staleTime: 30000, // 30 seconds
  });

  // Force refetch when filters change
  React.useEffect(() => {
    console.log("Sentiment Overview filters changed, refetching data:", filters);
    refetch();
  }, [filters, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!sentimentData || sentimentData.length === 0) {
    return (
      <EmptyDataState 
        message="No sentiment data available for the selected filters."
        subMessage="Try clearing some filters or submitting feedback."
      />
    );
  }

  // Calculate average sentiment by date
  const sentimentByDate = sentimentData.reduce((acc, curr) => {
    if (!curr.created_at) return acc;
    
    const date = format(parseISO(curr.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { 
        count: 0, 
        totalRating: 0, 
        totalScore: 0,
        ratings: [0, 0, 0, 0, 0] // Count for each rating (1-5)
      };
    }
    acc[date].count++;
    acc[date].totalRating += curr.rating;
    if (curr.sentiment_score !== null && curr.sentiment_score !== undefined) {
      acc[date].totalScore += curr.sentiment_score;
    }
    acc[date].ratings[curr.rating - 1]++;
    return acc;
  }, {} as Record<string, { count: number; totalRating: number; totalScore: number, ratings: number[] }>);

  // Sort dates chronologically for the time series
  const timeSeriesData = Object.keys(sentimentByDate)
    .sort()
    .map(date => ({
      date,
      rating: parseFloat((sentimentByDate[date].totalRating / sentimentByDate[date].count).toFixed(1)),
      count: sentimentByDate[date].count,
    }));

  // Calculate sentiment distribution
  const sentimentDistribution = sentimentData.reduce((acc, curr) => {
    let label = curr.sentiment_label?.toLowerCase() || 'unknown';
    // Simplify labels to just positive, neutral, negative
    if (label.includes('positive')) label = 'positive';
    if (label.includes('negative')) label = 'negative';
    if (label.includes('neutral')) label = 'neutral';
    
    if (!acc[label]) {
      acc[label] = 0;
    }
    acc[label]++;
    return acc;
  }, {} as Record<string, number>);

  const sentimentPieData = Object.keys(sentimentDistribution).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: sentimentDistribution[key]
  }));

  // Calculate tag distribution
  const tagCounts: Record<string, number> = {};
  let taggedFeedbackCount = 0;
  
  sentimentData.forEach(item => {
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
      taggedFeedbackCount++;
      item.tags.forEach(tag => {
        if (tag) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });
  
  // For sentiment with no tags, create default categories
  if (taggedFeedbackCount === 0 && sentimentData.length > 0) {
    sentimentData.forEach(item => {
      const label = item.sentiment_label?.toLowerCase() || 'unknown';
      const tagName = `${label.charAt(0).toUpperCase() + label.slice(1)} Feedback`;
      tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
    });
  }

  const tagData = Object.keys(tagCounts)
    .map(tag => ({ name: tag, count: tagCounts[tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate radar chart data for tag analysis
  const radarData = tagData.slice(0, 5).map(item => ({
    subject: item.name,
    count: item.count,
    fullMark: Math.max(...tagData.map(t => t.count)) + 2
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Mood Trend Over Time */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Employee Mood Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodTrendChart data={timeSeriesData} />
        </CardContent>
      </Card>

      {/* Sentiment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <SentimentPieChart data={sentimentPieData} />
        </CardContent>
      </Card>

      {/* Radar chart for top tags */}
      <Card>
        <CardHeader>
          <CardTitle>Top Feedback Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {radarData.length > 0 ? (
            <TopicRadarChart data={radarData} />
          ) : (
            <EmptyDataState message="No feedback topics available for the selected filters." />
          )}
        </CardContent>
      </Card>

      {/* Top Feedback Topics */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Topic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {tagData.length === 0 ? (
            <EmptyDataState 
              message="No feedback topics available for the selected filters."
              subMessage="Try clearing some filters or submitting more detailed feedback."
            />
          ) : (
            <TopicBarChart data={tagData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentOverview;
