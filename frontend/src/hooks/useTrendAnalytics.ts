
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

interface TrendData {
  period: string;
  issues: number;
  resolved: number;
  responseTime: number;
  trend: number;
}

interface TrendAnalytics {
  data: TrendData[];
  summary: {
    totalTrend: number;
    bestPeriod: string;
    worstPeriod: string;
  };
}

export const useTrendAnalytics = (filters: any = {}) => {
  const [data, setData] = useState<TrendAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendAnalytics();
  }, [filters]);

  const fetchTrendAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiClient.get('/api/analytics/trends');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trend analytics');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh: fetchTrendAnalytics
  };
};
