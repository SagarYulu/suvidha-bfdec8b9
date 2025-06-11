
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '@/services/issues/issueAnalyticsService';
import { getIssues } from '@/services/issues/issueFilters';
import { apiCall } from '@/config/api';
import { DashboardFilters } from '@/types';

interface IssueFilters extends DashboardFilters {
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<DashboardFilters>({});

  // Analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics', filters],
    queryFn: () => getAnalytics(filters as any),
    staleTime: 5 * 60 * 1000,
  });

  // Recent issues
  const { data: recentIssuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['dashboard-recent-issues', filters],
    queryFn: () => {
      const issueFilters: IssueFilters = { 
        ...filters, 
        limit: 10, 
        sortBy: 'created_at', 
        sortOrder: 'desc' 
      };
      return getIssues(issueFilters as any);
    },
    staleTime: 5 * 60 * 1000,
  });

  // User count
  const { data: userCount = 0, isLoading: userCountLoading } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () => {
      const response = await apiCall('/users/count');
      return response.count || 0;
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleFilterChange = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  // Transform data for charts
  const typePieData = useMemo(() => {
    if (!analytics?.typeCounts) return [];
    return Object.entries(analytics.typeCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [analytics?.typeCounts]);

  const cityBarData = useMemo(() => {
    if (!analytics?.cityCounts) return [];
    return Object.entries(analytics.cityCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [analytics?.cityCounts]);

  const isLoading = analyticsLoading || issuesLoading || userCountLoading;

  // Extract issues from the response data
  const recentIssues = Array.isArray(recentIssuesData) ? recentIssuesData : [];

  return {
    analytics,
    recentIssues,
    userCount,
    filters,
    isLoading,
    handleFilterChange,
    typePieData,
    cityBarData
  };
};
