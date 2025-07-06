
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

interface SentimentData {
  totalFeedback: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export const useSentiment = (filters: any = {}) => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSentimentData();
  }, [filters]);

  const fetchSentimentData = async () => {
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
    refresh: fetchSentimentData
  };
};
