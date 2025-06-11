
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '@/services/issues/issueAnalyticsService';
import { getIssues } from '@/services/issues/issueFilters';
import { apiCall } from '@/config/api';

interface DashboardFilters {
  city?: string;
  cluster?: string;
  type?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  dateFrom?: string;
  dateTo?: string;
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<DashboardFilters>({});

  // Analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics', filters],
    queryFn: () => getAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Recent issues - transform filters to match IssueFilters
  const issueFilters = useMemo(() => ({
    ...filters,
    cluster: filters.cluster,
    issueType: filters.type || filters.issueType,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    sortBy: 'created_at',
    sortOrder: 'desc'
  }), [filters]);

  const { data: recentIssuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['dashboard-recent-issues', issueFilters],
    queryFn: () => getIssues(issueFilters),
    staleTime: 5 * 60 * 1000,
  });

  // User count
  const { data: userCount = 0, isLoading: userCountLoading } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () => {
      const response = await apiCall('/users/count');
      return response.count || response.data?.count || 0;
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleFilterChange = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  // Extract issues from API response
  const recentIssues = useMemo(() => {
    if (Array.isArray(recentIssuesData)) {
      return recentIssuesData.slice(0, 10);
    }
    if (recentIssuesData?.issues) {
      return recentIssuesData.issues.slice(0, 10);
    }
    if (recentIssuesData?.data) {
      return recentIssuesData.data.slice(0, 10);
    }
    return [];
  }, [recentIssuesData]);

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
    recentIssues,
    userCount,
    filters,
    isLoading,
    handleFilterChange,
    typePieData,
    cityBarData
  };
};
