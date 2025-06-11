
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllSentiment,
  submitSentiment,
  getSentimentAnalytics,
  getSentimentTrends,
  SentimentFilters,
  SentimentEntry
} from '@/services/sentimentService';

export const useSentiment = (initialFilters?: SentimentFilters) => {
  const [filters, setFilters] = useState<SentimentFilters>(initialFilters || {});
  const queryClient = useQueryClient();

  const {
    data: sentimentData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['sentiment', filters],
    queryFn: () => fetchAllSentiment(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: analytics,
    isLoading: analyticsLoading
  } = useQuery({
    queryKey: ['sentiment-analytics', filters],
    queryFn: () => getSentimentAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: trends,
    isLoading: trendsLoading
  } = useQuery({
    queryKey: ['sentiment-trends', filters],
    queryFn: () => getSentimentTrends('weekly', filters),
    staleTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: submitSentiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-trends'] });
    },
  });

  const handleFilterChange = useCallback((newFilters: Partial<SentimentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const submitFeedback = useCallback(async (data: {
    rating: number;
    feedback_text?: string;
    employee_uuid: string;
    tags?: string[];
  }) => {
    return submitMutation.mutateAsync(data);
  }, [submitMutation]);

  return {
    sentimentData: sentimentData || [],
    analytics,
    trends,
    filters,
    isLoading,
    analyticsLoading,
    trendsLoading,
    isSubmitting: submitMutation.isPending,
    handleFilterChange,
    clearFilters,
    submitFeedback,
    refetch
  };
};
