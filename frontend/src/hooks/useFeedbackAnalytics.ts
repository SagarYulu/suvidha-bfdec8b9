
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getFeedbackMetrics,
  getFeedbackTrends,
  getFeedbackByCategory,
  getSentimentAnalysis,
  exportFeedbackData,
  FeedbackMetrics,
  FeedbackTrendData,
  FeedbackByCategory,
  SentimentAnalysis
} from '@/services/feedbackAnalyticsService';

interface FeedbackFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  category?: string;
  rating?: number;
  issueType?: string;
}

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
