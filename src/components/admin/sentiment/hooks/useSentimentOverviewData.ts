
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSentiment } from '@/services/sentimentService';
import { format, parseISO } from 'date-fns';

interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
}

export const useSentimentOverviewData = (filters: SentimentFilters) => {
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

  // If data is loading or empty, return early
  if (isLoading) {
    return { isLoading, sentimentData: null, timeSeriesData: [], sentimentPieData: [], tagData: [], radarData: [] };
  }

  if (!sentimentData || sentimentData.length === 0) {
    return { isLoading, sentimentData: [], timeSeriesData: [], sentimentPieData: [], tagData: [], radarData: [] };
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

  return {
    isLoading,
    sentimentData,
    timeSeriesData,
    sentimentPieData,
    tagData,
    radarData
  };
};
