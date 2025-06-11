
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboardService';

interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  city?: string;
  cluster?: string;
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<DashboardFilters>({});

  const { 
    data: analytics, 
    isLoading: analyticsLoading,
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['dashboard-analytics', filters],
    queryFn: () => DashboardService.getAnalytics(filters),
    refetchInterval: 30000,
  });

  const { 
    data: recentIssues = [], 
    isLoading: issuesLoading 
  } = useQuery({
    queryKey: ['recent-issues'],
    queryFn: () => DashboardService.getRecentIssues(10),
    refetchInterval: 30000,
  });

  const { 
    data: userCount = 0, 
    isLoading: userCountLoading 
  } = useQuery({
    queryKey: ['user-count'],
    queryFn: () => DashboardService.getUserCount(),
    refetchInterval: 60000,
  });

  const isLoading = analyticsLoading || issuesLoading || userCountLoading;

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const typePieData = analytics?.issuesByType?.map((item: any) => ({
    name: item.type,
    value: item.count
  })) || [];

  const cityBarData = analytics?.issuesByStatus?.map((item: any) => ({
    name: item.status,
    value: item.count
  })) || [];

  return {
    analytics,
    recentIssues,
    isLoading,
    userCount,
    handleFilterChange,
    typePieData,
    cityBarData,
    filters,
    refetchAnalytics
  };
};
