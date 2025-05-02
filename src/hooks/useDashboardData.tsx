
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getIssues, IssueFilters } from "@/services/issueService";
import { getUsers } from "@/services/userService";
import { Issue } from "@/types";
import { toast } from "sonner";

export const useDashboardData = () => {
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
  // Query for issues data with proper caching
  const { 
    data: issues = [], 
    isLoading: isIssuesLoading,
    refetch: refetchIssues,
    error: issuesError
  } = useQuery({
    queryKey: ['issues', filters],
    queryFn: async () => {
      console.log("Fetching issues with filters:", filters);
      const result = await getIssues(filters);
      console.log(`Retrieved ${result.length} issues after filtering`);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
  });
  
  // Query for analytics data with proper caching - making sure to use the fresh filters
  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      console.log("Fetching analytics with filters:", filters);
      return getAnalytics(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
    enabled: !isIssuesLoading, // Only run after issues query completes
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
  
  // Force refetches when filters change
  useEffect(() => {
    const fetchData = async () => {
      console.log("Filter changed, refetching data with:", filters);
      await refetchIssues();
      await refetchAnalytics();
    };
    
    fetchData();
  }, [filters, refetchIssues, refetchAnalytics]);

  // Display errors if they occur
  useEffect(() => {
    if (issuesError) {
      console.error("Error fetching issues:", issuesError);
      toast.error("Failed to load issues data");
    }
    
    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
      toast.error("Failed to load analytics data");
    }
  }, [issuesError, analyticsError]);
  
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
  
  // Filter change handler - immediately triggers data refresh
  const handleFilterChange = useCallback((newFilters: IssueFilters) => {
    console.log("Filter changed:", newFilters);
    setFilters(newFilters);
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
    cityBarData,
    issues // Export issues for debugging
  };
};
