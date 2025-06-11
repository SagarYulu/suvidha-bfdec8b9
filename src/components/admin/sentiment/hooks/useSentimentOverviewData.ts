
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSentiment } from '@/services/sentimentService';
import { format, parseISO, subWeeks, subMonths, subQuarters, subYears } from 'date-fns';
import { ComparisonMode, COMPARISON_MODE_LABELS } from '@/components/admin/sentiment/ComparisonModeDropdown';

interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: ComparisonMode;
}

export const useSentimentOverviewData = (filters: SentimentFilters) => {
  // Current period data query
  const { data: sentimentData, isLoading, refetch } = useQuery({
    queryKey: ['sentiment', filters],
    queryFn: () => fetchAllSentiment(filters),
    staleTime: 0, // Ensure we always get fresh data
  });

  // Calculate date range for previous period based on comparison mode
  const getPreviousPeriodDates = () => {
    if (!filters.comparisonMode || filters.comparisonMode === 'none' || !filters.startDate || !filters.endDate) {
      return null;
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    let prevStartDate, prevEndDate;

    switch (filters.comparisonMode) {
      case 'wow':
        prevStartDate = format(subWeeks(startDate, 1), 'yyyy-MM-dd');
        prevEndDate = format(subWeeks(endDate, 1), 'yyyy-MM-dd');
        break;
      case 'mom':
        prevStartDate = format(subMonths(startDate, 1), 'yyyy-MM-dd');
        prevEndDate = format(subMonths(endDate, 1), 'yyyy-MM-dd');
        break;
      case 'qoq':
        prevStartDate = format(subQuarters(startDate, 1), 'yyyy-MM-dd');
        prevEndDate = format(subQuarters(endDate, 1), 'yyyy-MM-dd');
        break;
      case 'yoy':
        prevStartDate = format(subYears(startDate, 1), 'yyyy-MM-dd');
        prevEndDate = format(subYears(endDate, 1), 'yyyy-MM-dd');
        break;
    }

    return { startDate: prevStartDate, endDate: prevEndDate };
  };

  // Previous period filters
  const previousPeriodFilters = getPreviousPeriodDates();

  // Previous period data query
  const { data: previousPeriodData, isLoading: isLoadingPreviousPeriod } = useQuery({
    queryKey: ['sentiment-previous', { ...filters, ...previousPeriodFilters }],
    queryFn: () => fetchAllSentiment({
      ...filters,
      startDate: previousPeriodFilters?.startDate,
      endDate: previousPeriodFilters?.endDate,
    }),
    enabled: !!previousPeriodFilters && filters.comparisonMode !== 'none',
    staleTime: 0, // Ensure we always get fresh data
  });

  // Force refetch when filters change
  React.useEffect(() => {
    console.log("Sentiment Overview filters changed, refetching data:", filters);
    refetch();
  }, [filters, refetch]);

  // Check if we should show comparison data
  const hasPreviousPeriodData = !!previousPeriodData && 
                               Array.isArray(previousPeriodData) &&
                               previousPeriodData.length > 0;
  
  const showComparison = filters.comparisonMode && 
                         filters.comparisonMode !== 'none' && 
                         hasPreviousPeriodData;

  // Calculate comparison insights
  const getComparisonInsights = () => {
    if (!showComparison || !sentimentData || !previousPeriodData || 
        sentimentData.length === 0 || previousPeriodData.length === 0) {
      return [];
    }

    // Calculate average mood
    const currAvgMood = sentimentData.reduce((sum, item) => sum + item.rating, 0) / sentimentData.length;
    const prevAvgMood = previousPeriodData.reduce((sum, item) => sum + item.rating, 0) / previousPeriodData.length;
    const moodChange = ((currAvgMood - prevAvgMood) / prevAvgMood) * 100;

    // Calculate sentiment distribution
    const currSentiment = calculateSentimentDistribution(sentimentData);
    const prevSentiment = calculateSentimentDistribution(previousPeriodData);
    
    const positivePctChange = ((currSentiment.positive || 0) / sentimentData.length * 100) - 
                              ((prevSentiment.positive || 0) / previousPeriodData.length * 100);
    const negativePctChange = ((currSentiment.negative || 0) / sentimentData.length * 100) - 
                              ((prevSentiment.negative || 0) / previousPeriodData.length * 100);

    // Calculate topic changes
    const currTopics = calculateTagDistribution(sentimentData);
    const prevTopics = calculateTagDistribution(previousPeriodData);
    
    // Find most improved and most declined topics
    let mostImproved = { topic: '', change: 0 };
    let mostDeclined = { topic: '', change: 0 };
    
    Object.keys(currTopics).forEach(topic => {
      if (prevTopics[topic]) {
        const currentRatio = (currTopics[topic] / sentimentData.length);
        const prevRatio = (prevTopics[topic] / previousPeriodData.length); 
        const change = ((currentRatio - prevRatio) / prevRatio) * 100;
        
        // Only consider topics that have appeared more than once
        if (currTopics[topic] > 1 && prevTopics[topic] > 1) {
          if (change > mostImproved.change) {
            mostImproved = { topic, change };
          }
          
          if (change < mostDeclined.change) {
            mostDeclined = { topic, change: change };
          }
        }
      }
    });

    return [
      {
        label: 'Mood Trend',
        value: currAvgMood.toFixed(1),
        change: moodChange
      },
      {
        label: 'Positive Sentiment',
        value: `${((currSentiment.positive || 0) / sentimentData.length * 100).toFixed(0)}%`,
        change: positivePctChange
      },
      {
        label: mostImproved.topic ? 'Most Improved' : 'No Improvement',
        value: mostImproved.topic || 'N/A',
        change: mostImproved.change
      },
      {
        label: mostDeclined.topic ? 'Largest Drop' : 'No Decline',
        value: mostDeclined.topic || 'N/A',
        change: mostDeclined.change
      }
    ];
  };

  // If data is loading or empty, return early
  if (isLoading) {
    return { 
      isLoading, 
      isLoadingComparison: isLoadingPreviousPeriod,
      sentimentData: null, 
      timeSeriesData: [], 
      sentimentPieData: [], 
      tagData: [], 
      radarData: [],
      comparisonInsights: [],
      showComparison: false,
      hasPreviousPeriodData: false
    };
  }

  if (!sentimentData || sentimentData.length === 0) {
    return { 
      isLoading, 
      isLoadingComparison: isLoadingPreviousPeriod,
      sentimentData: [], 
      timeSeriesData: [], 
      sentimentPieData: [], 
      tagData: [], 
      radarData: [],
      comparisonInsights: [],
      showComparison: false,
      hasPreviousPeriodData: false
    };
  }

  // Helper function to calculate sentiment distribution
  const calculateSentimentDistribution = (data: any[]) => {
    return data.reduce((acc, curr) => {
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
  };

  // Calculate average sentiment by date for current period
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

  // Calculate average sentiment by date for previous period
  const previousSentimentByDate = showComparison ? previousPeriodData.reduce((acc, curr) => {
    if (!curr.created_at) return acc;
    
    // For comparison, adjust dates to align with current period
    let dateObj = parseISO(curr.created_at);
    let adjustedDate: Date;
    
    switch (filters.comparisonMode) {
      case 'wow':
        adjustedDate = new Date(dateObj.setDate(dateObj.getDate() + 7));
        break;
      case 'mom':
        adjustedDate = new Date(dateObj.setMonth(dateObj.getMonth() + 1));
        break;
      case 'qoq':
        adjustedDate = new Date(dateObj.setMonth(dateObj.getMonth() + 3));
        break;
      case 'yoy':
        adjustedDate = new Date(dateObj.setFullYear(dateObj.getFullYear() + 1));
        break;
      default:
        adjustedDate = dateObj;
    }
    
    const date = format(adjustedDate, 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { 
        count: 0, 
        totalRating: 0, 
        totalScore: 0
      };
    }
    acc[date].count++;
    acc[date].totalRating += curr.rating;
    if (curr.sentiment_score !== null && curr.sentiment_score !== undefined) {
      acc[date].totalScore += curr.sentiment_score;
    }
    return acc;
  }, {} as Record<string, { count: number; totalRating: number; totalScore: number }>) : {};

  // Create time series data
  const timeSeriesData = Object.keys(sentimentByDate)
    .map(date => {
      const result = {
        date,
        rating: parseFloat((sentimentByDate[date].totalRating / sentimentByDate[date].count).toFixed(1)),
        count: sentimentByDate[date].count,
      };
      
      // Add previous period data if available
      if (showComparison && previousSentimentByDate[date]) {
        result['previousRating'] = parseFloat(
          (previousSentimentByDate[date].totalRating / previousSentimentByDate[date].count).toFixed(1)
        );
        result['previousCount'] = previousSentimentByDate[date].count;
      }
      
      return result;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending

  // Calculate sentiment distribution for current period and previous period
  const sentimentDistribution = calculateSentimentDistribution(sentimentData);
  const previousSentimentDistribution = showComparison ? 
    calculateSentimentDistribution(previousPeriodData) : {};

  // Create sentiment pie chart data with comparison
  const sentimentPieData = Object.keys(sentimentDistribution).map(key => {
    const result = {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: sentimentDistribution[key]
    };
    
    // Add previous period data if available
    if (showComparison && previousSentimentDistribution[key]) {
      result['previousValue'] = previousSentimentDistribution[key];
    }
    
    return result;
  });

  // Helper function to calculate tag distribution
  const calculateTagDistribution = (data: any[]) => {
    const tagCounts: Record<string, number> = {};
    let taggedFeedbackCount = 0;
    
    data.forEach(item => {
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
    if (taggedFeedbackCount === 0 && data.length > 0) {
      data.forEach(item => {
        const label = item.sentiment_label?.toLowerCase() || 'unknown';
        const tagName = `${label.charAt(0).toUpperCase() + label.slice(1)} Feedback`;
        tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
      });
    }
    
    return tagCounts;
  };

  // Calculate tag distributions for current and previous periods
  const tagCounts = calculateTagDistribution(sentimentData);
  const previousTagCounts = showComparison ? 
    calculateTagDistribution(previousPeriodData) : {};

  // Create tag data for bar chart with comparison
  const tagData = Object.keys(tagCounts)
    .map(tag => {
      const result = { 
        name: tag, 
        count: tagCounts[tag] 
      };
      
      // Add previous period data if available
      if (showComparison && previousTagCounts[tag]) {
        result['previousCount'] = previousTagCounts[tag];
      }
      
      return result;
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate radar chart data for tag analysis with comparison
  const radarData = tagData.slice(0, 5).map(item => {
    const result = {
      subject: item.name,
      count: item.count,
      fullMark: Math.max(...tagData.map(t => t.count)) + 2
    };
    
    // Add previous period data if available
    if (showComparison && 'previousCount' in item) {
      result['previousCount'] = item.previousCount;
    }
    
    return result;
  });

  // Calculate comparison insights
  const comparisonInsights = showComparison ? getComparisonInsights() : [];

  return {
    isLoading,
    isLoadingComparison: isLoadingPreviousPeriod,
    sentimentData,
    previousPeriodData: previousPeriodData || [],
    timeSeriesData,
    sentimentPieData,
    tagData,
    radarData,
    comparisonInsights,
    showComparison,
    hasPreviousPeriodData,
    comparisonMode: filters.comparisonMode,
    comparisonLabel: filters.comparisonMode ? COMPARISON_MODE_LABELS[filters.comparisonMode] : ''
  };
};
