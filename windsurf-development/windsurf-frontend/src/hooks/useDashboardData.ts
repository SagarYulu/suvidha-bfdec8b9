
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { useState } from 'react';

export const useDashboardData = () => {
  const [filters, setFilters] = useState({});

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics', filters],
    queryFn: () => apiService.getDashboardMetrics(),
  });

  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['recent-issues'],
    queryFn: () => apiService.getIssues({ limit: 10 }),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => apiService.getUsers({ limit: 1 }),
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return {
    analytics: analytics?.data,
    recentIssues: issuesData?.data?.issues || [],
    userCount: usersData?.pagination?.total || 0,
    isLoading: analyticsLoading || issuesLoading || usersLoading,
    handleFilterChange,
    filters,
    typePieData: [],
    cityBarData: [],
  };
};
