
import { useState, useEffect } from 'react';
import { feedbackAnalyticsService } from '@/services/feedbackAnalyticsService';

interface FeedbackAnalyticsData {
  overview: any;
  trends: any;
  breakdown: any;
}

export const useFeedbackAnalytics = (filters: Record<string, any>) => {
  const [data, setData] = useState<FeedbackAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [overview, trends, breakdown] = await Promise.all([
        feedbackAnalyticsService.getFeedbackOverview(filters),
        feedbackAnalyticsService.getFeedbackTrends(filters),
        feedbackAnalyticsService.getFeedbackBreakdown(filters)
      ]);

      setData({ overview, trends, breakdown });
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load feedback analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch: loadAnalytics };
};
