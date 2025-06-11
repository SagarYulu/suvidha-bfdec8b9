
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardFilters, IssueFilters } from '@/types';

export const useDashboardData = () => {
  const [filters, setFilters] = useState<DashboardFilters>({});

  // Convert DashboardFilters to IssueFilters
  const convertToIssueFilters = (dashFilters: DashboardFilters): IssueFilters => {
    return {
      ...dashFilters,
      cluster: dashFilters.cluster || '',
      issueType: dashFilters.issueType || dashFilters.type || '',
    };
  };

  // Analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics', filters],
    queryFn: async () => {
      // TODO: Implement with local backend
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Recent issues
  const { data: recentIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['dashboard-recent-issues', filters],
    queryFn: async () => {
      // TODO: Implement with local backend
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // User count
  const { data: userCount = 0, isLoading: userCountLoading } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () => {
      // TODO: Implement with local backend
      return 0;
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

  return {
    analytics,
    recentIssues: recentIssues || [],
    userCount,
    filters,
    isLoading,
    handleFilterChange,
    typePieData,
    cityBarData
  };
};
