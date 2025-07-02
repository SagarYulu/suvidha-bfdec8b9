
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

export interface FeedbackMetrics {
  totalFeedback: number;
  responseRate: number;
  positiveSentiment: number;
  averageRating: number;
}

export const useFeedbackAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<FeedbackMetrics | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.get('/api/feedback/analytics');
      setMetrics(response.data.metrics);
      setRawData(response.data.rawData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const toggleComparison = (enabled: boolean) => {
    if (enabled) {
      // Fetch comparison data
      fetchComparisonData();
    } else {
      setComparisonMetrics(null);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const response = await ApiClient.get('/api/feedback/analytics/comparison');
      setComparisonMetrics(response.data.metrics);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
    }
  };

  return {
    isLoading,
    error,
    metrics,
    comparisonMetrics,
    rawData,
    filters,
    updateFilters,
    toggleComparison
  };
};
