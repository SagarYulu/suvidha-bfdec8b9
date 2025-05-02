
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getIssues, IssueFilters } from "@/services/issueService";
import { getUsers } from "@/services/userService";
import { Issue } from "@/types";

export const useDashboardData = () => {
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
  // Query for analytics data with proper caching
  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading 
  } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => getAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
  });
  
  // Query for issues data with proper caching
  const { 
    data: issues = [], 
    isLoading: isIssuesLoading 
  } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => getIssues(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
  });
  
  // Query for users data with proper caching
  const { 
    data: users = [], 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    staleTime: 30 * 60 * 1000, // 30 minutes before refetching
  });
  
  // Memoize these calculations to prevent recalculations on re-renders
  const recentIssues = useMemo(() => {
    const sortedIssues = [...issues].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedIssues.slice(0, 5);
  }, [issues]);
  
  const userCount = useMemo(() => {
    return users.filter(user => user.role === "employee").length;
  }, [users]);
  
  // Memoize chart data to prevent recalculations
  const typePieData = useMemo(() => {
    if (!analytics || !analytics.typeCounts) return [];
    return Object.entries(analytics.typeCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  }, [analytics]);
  
  const cityBarData = useMemo(() => {
    if (!analytics || !analytics.cityCounts) return [];
    return Object.entries(analytics.cityCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  }, [analytics]);
  
  // Filter change handler (memoized to prevent recreation)
  const handleFilterChange = useMemo(() => {
    return (newFilters: IssueFilters) => {
      setFilters(prevFilters => {
        // Only update if filters actually changed
        if (JSON.stringify(prevFilters) === JSON.stringify(newFilters)) {
          return prevFilters;
        }
        return newFilters;
      });
    };
  }, []);

  const isLoading = isAnalyticsLoading || isIssuesLoading || isUsersLoading;

  return {
    analytics,
    recentIssues,
    isLoading,
    userCount,
    filters,
    handleFilterChange,
    typePieData,
    cityBarData
  };
};
