
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

interface SentimentOverviewData {
  totalFeedback: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  trend: 'up' | 'down' | 'stable';
  topTopics: Array<{
    subject: string;
    count: number;
    fullMark: number;
  }>;
  sentimentDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export const useSentimentOverviewData = (filters: any = {}) => {
  const [data, setData] = useState<SentimentOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSentimentOverview();
  }, [filters]);

  const fetchSentimentOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiClient.get('/api/sentiment/overview');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sentiment data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh: fetchSentimentOverview
  };
};
