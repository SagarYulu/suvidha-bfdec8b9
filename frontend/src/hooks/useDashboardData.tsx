
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

interface DashboardData {
  analytics: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    avgResolutionTime: number;
  };
  userCount: number;
  recentIssues: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assigned_to_name: string;
    created_at: string;
    emp_name: string;
    emp_code: string;
  }>;
  typePieData: Array<{ issue_type: string; count: number }>;
  cityBarData: Array<{ name: string; value: number }>;
}

export const useDashboardData = (initialFilters: any = {}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiClient.get('/api/dashboard/overview', {
        params: filters
      });
      
      setData(response.data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    analytics: data?.analytics,
    userCount: data?.userCount,
    recentIssues: data?.recentIssues,
    typePieData: data?.typePieData,
    cityBarData: data?.cityBarData,
    isLoading,
    error,
    filters,
    handleFilterChange,
    refresh: fetchDashboardData
  };
};
