
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

interface DashboardData {
  metrics: Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
    icon: string;
  }>;
  charts: Array<{
    title: string;
    data: Array<{ name: string; value: number }>;
    type: 'bar' | 'line';
  }>;
  recentTickets: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee: string;
    createdAt: string;
    employeeName: string;
  }>;
}

export const useDashboardData = (filters: any = {}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiClient.get('/api/dashboard/overview');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData
  };
};
