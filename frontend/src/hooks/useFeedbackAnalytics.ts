
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FeedbackMetrics, FeedbackFilters, ComparisonMode } from '@/types';

// Mock service functions since the real service isn't available
const getFeedbackMetrics = async (filters: FeedbackFilters): Promise<FeedbackMetrics> => {
  // Mock implementation
  return {
    averageRating: 4.2,
    totalResponses: 150,
    responseRate: 85,
    totalCount: 150,
    sentimentDistribution: {
      positive: 65,
      neutral: 25,
      negative: 10
    },
    sentimentCounts: {
      happy: 98,
      neutral: 38,
      sad: 14
    },
    sentimentPercentages: {
      happy: 65.3,
      neutral: 25.3,
      sad: 9.3
    },
    topOptions: [
      { option: "Great service", count: 45, percentage: 30 },
      { option: "Quick response", count: 38, percentage: 25.3 }
    ],
    trendData: [
      { date: "2024-01-01", rating: 4.1, responses: 25 },
      { date: "2024-01-02", rating: 4.3, responses: 30 }
    ]
  };
};

const getFeedbackTrends = async (period: 'daily' | 'weekly' | 'monthly', filters: FeedbackFilters) => {
  return [];
};

const getFeedbackByCategory = async (filters: FeedbackFilters) => {
  return [];
};

const getSentimentAnalysis = async (filters: FeedbackFilters) => {
  return {};
};

const exportFeedbackData = async (format: 'csv' | 'excel' | 'pdf', filters: FeedbackFilters): Promise<Blob> => {
  return new Blob(['mock data'], { type: 'text/csv' });
};

export const useFeedbackAnalytics = (initialFilters?: FeedbackFilters) => {
  const [filters, setFilters] = useState<FeedbackFilters>(initialFilters || {});
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['feedback-metrics', filters],
    queryFn: () => getFeedbackMetrics(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: trends,
    isLoading: trendsLoading,
    refetch: refetchTrends
  } = useQuery({
    queryKey: ['feedback-trends', selectedPeriod, filters],
    queryFn: () => getFeedbackTrends(selectedPeriod, filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['feedback-categories', filters],
    queryFn: () => getFeedbackByCategory(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: sentiment,
    isLoading: sentimentLoading,
    refetch: refetchSentiment
  } = useQuery({
    queryKey: ['feedback-sentiment', filters],
    queryFn: () => getSentimentAnalysis(filters),
    staleTime: 5 * 60 * 1000,
  });

  const handleFilterChange = useCallback((newFilters: Partial<FeedbackFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handlePeriodChange = useCallback((period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await exportFeedbackData(format, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [filters]);

  const refreshData = useCallback(() => {
    refetchMetrics();
    refetchTrends();
    refetchCategories();
    refetchSentiment();
  }, [refetchMetrics, refetchTrends, refetchCategories, refetchSentiment]);

  useEffect(() => {
    refreshData();
  }, [filters, selectedPeriod]);

  const isLoading = metricsLoading || trendsLoading || categoriesLoading || sentimentLoading;

  return {
    metrics,
    trends,
    categories,
    sentiment,
    filters,
    selectedPeriod,
    isLoading,
    handleFilterChange,
    handlePeriodChange,
    handleExport,
    refreshData
  };
};
