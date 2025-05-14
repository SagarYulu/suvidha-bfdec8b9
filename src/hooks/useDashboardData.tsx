
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from "@/services/issues/issueAnalyticsService";
import { getIssues, IssueFilters } from "@/services/issues/issueFilters";
import { getUsers } from "@/services/userService";
import { getResolutionTimeTrends } from "@/services/issues/issueAnalyticsService";
import { toast } from "sonner";

// Date range type for filtering
export interface DateRange {
  from?: Date;
  to?: Date;
}

export const useDashboardData = () => {
  // Initialize with null values for all filter fields
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
  // Date range state for primary data
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  
  // Date range state for comparison data
  const [comparisonDateRange, setComparisonDateRange] = useState<DateRange | null>(null);
  
  // State to track if comparison mode is active
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  
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
    refetchOnWindowFocus: false, // Prevent unwanted refetches
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
    refetchOnWindowFocus: false, // Prevent unwanted refetches
  });
  
  // Query for resolution time trends data with date range support
  const {
    data: resolutionTimeData,
    isLoading: isResolutionTimeLoading,
    refetch: refetchResolutionTimeTrends,
    error: resolutionTimeError
  } = useQuery({
    queryKey: ['resolutionTimeTrends', filters, dateRange, comparisonDateRange, comparisonMode],
    queryFn: async () => {
      console.log("Fetching resolution time trends with filters:", filters);
      console.log("Date range:", dateRange ? 
        `From: ${dateRange.from?.toISOString().split('T')[0]} To: ${dateRange.to?.toISOString().split('T')[0]}` : 
        "Not active");
      console.log("Comparison date range:", comparisonMode ? 
        (comparisonDateRange ? 
          `From: ${comparisonDateRange.from?.toISOString().split('T')[0]} To: ${comparisonDateRange.to?.toISOString().split('T')[0]}` : 
          "Not set") : 
        "Not active");
      
      // Ensure we have valid date ranges before fetching
      if (dateRange && (!dateRange.from || !dateRange.to)) {
        console.warn("Incomplete date range, skipping fetch");
        return { primaryData: { daily: [], weekly: [], monthly: [], quarterly: [] } };
      }
      
      // Pass proper date ranges to the service
      return getResolutionTimeTrends(
        filters,
        dateRange || undefined,
        comparisonMode ? comparisonDateRange || undefined : undefined
      );
    },
    staleTime: 0, // Don't cache this data as it's highly dependent on filters and date ranges
    refetchOnWindowFocus: false, // Prevent unwanted refetches
  });
  
  // Query for users data with proper caching
  const { 
    data: users = [], 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    staleTime: 30 * 60 * 1000, // 30 minutes before refetching
    refetchOnWindowFocus: false, // Prevent unwanted refetches
  });
  
  // Force immediate refetch when filters or date ranges change
  useEffect(() => {
    const fetchData = async () => {
      console.log("Filter or date range changed, refetching data");
      try {
        await Promise.all([
          refetchIssues(), 
          refetchAnalytics(),
          refetchResolutionTimeTrends()
        ]);
      } catch (error) {
        console.error("Error refetching data:", error);
      }
    };
    
    fetchData();
  }, [filters, dateRange, comparisonDateRange, comparisonMode, refetchIssues, refetchAnalytics, refetchResolutionTimeTrends]);

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
    
    if (resolutionTimeError) {
      console.error("Error fetching resolution time trends:", resolutionTimeError);
      toast.error("Failed to load resolution time trends");
    }
  }, [issuesError, analyticsError, resolutionTimeError]);
  
  // Verify resolution time data whenever it changes
  useEffect(() => {
    if (resolutionTimeData) {
      console.log("Resolution time data received:", JSON.stringify(resolutionTimeData, null, 2));
    }
  }, [resolutionTimeData]);
  
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
    if (!analytics?.typeCounts) {
      console.log("No type counts data available for pie chart");
      return [];
    }
    const data = Object.entries(analytics.typeCounts).map(([name, value]) => ({
      name,
      value
    }));
    console.log("Generated type pie data:", data);
    return data;
  }, [analytics]);
  
  const cityBarData = useMemo(() => {
    if (!analytics?.cityCounts) {
      console.log("No city counts data available for bar chart");
      return [];
    }
    const data = Object.entries(analytics.cityCounts).map(([name, value]) => ({
      name,
      value
    }));
    console.log("Generated city bar data:", data);
    return data;
  }, [analytics]);
  
  // Improved filter change handler with consistent state management
  const handleFilterChange = useCallback((newFilters: IssueFilters) => {
    console.log("Filter change requested:", newFilters);
    
    // Update all filters at once to ensure consistency
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      // Update city if specified
      if ('city' in newFilters) {
        updatedFilters.city = newFilters.city;
        // If city changes, reset cluster
        if (newFilters.city !== prevFilters.city) {
          updatedFilters.cluster = null;
        }
      }
      
      // Update cluster if specified
      if ('cluster' in newFilters) {
        updatedFilters.cluster = newFilters.cluster;
      }
      
      // Update issueType if specified
      if ('issueType' in newFilters) {
        updatedFilters.issueType = newFilters.issueType;
      }
      
      console.log("Setting new filters:", updatedFilters);
      return updatedFilters;
    });
  }, []);

  // Handler for date range changes
  const handleDateRangeChange = useCallback((range: DateRange | null) => {
    console.log("Primary date range changed to:", range ? 
      `From: ${range.from?.toLocaleDateString()} To: ${range.to?.toLocaleDateString()}` : 
      "None");
    setDateRange(range);
  }, []);

  // Handler for comparison date range changes
  const handleComparisonDateRangeChange = useCallback((range: DateRange | null) => {
    console.log("Comparison date range changed to:", range ? 
      `From: ${range.from?.toLocaleDateString()} To: ${range.to?.toLocaleDateString()}` : 
      "None");
    setComparisonDateRange(range);
  }, []);

  // Toggle comparison mode
  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(prev => !prev);
  }, []);

  const isLoading = isAnalyticsLoading || isIssuesLoading || isUsersLoading || isResolutionTimeLoading;

  return {
    analytics,
    recentIssues,
    isLoading,
    userCount,
    filters,
    handleFilterChange,
    typePieData,
    cityBarData,
    issues,
    resolutionTimeData,
    dateRange,
    setDateRange: handleDateRangeChange,
    comparisonDateRange,
    setComparisonDateRange: handleComparisonDateRangeChange,
    comparisonMode,
    toggleComparisonMode
  };
};
