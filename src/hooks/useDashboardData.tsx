
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from "@/services/issueService";
import { getIssues, IssueFilters } from "@/services/issueService";
import { getUsers } from "@/services/userService";
import { toast } from "sonner";

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
  
  // Query for analytics data with proper caching - no filter parameter
  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      console.log("Fetching analytics");
      return getAnalytics();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
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
  
  // Force immediate refetch when filters change
  useEffect(() => {
    const fetchData = async () => {
      console.log("Filter changed, refetching data");
      try {
        await Promise.all([
          refetchIssues(), 
          refetchAnalytics()
        ]);
      } catch (error) {
        console.error("Error refetching data:", error);
      }
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
  
  // Memoize chart data to prevent recalculations - adapted for the new analytics structure
  const typePieData = useMemo(() => {
    if (!analytics?.byType) {
      console.log("No type counts data available for pie chart");
      return [];
    }
    const data = Object.entries(analytics.byType).map(([name, value]) => ({
      name,
      value
    }));
    console.log("Generated type pie data:", data);
    return data;
  }, [analytics]);
  
  const cityBarData = useMemo(() => {
    // Create dummy data for city bar chart if it's not available in analytics
    // This can be updated later when we implement proper city analytics
    const dummyData = [
      { name: "Bangalore", value: issues.filter(i => i.employeeUuid.includes("bangalore")).length || 5 },
      { name: "Delhi", value: issues.filter(i => i.employeeUuid.includes("delhi")).length || 3 },
      { name: "Mumbai", value: issues.filter(i => i.employeeUuid.includes("mumbai")).length || 7 }
    ];
    console.log("Generated city bar data:", dummyData);
    return dummyData;
  }, [issues]);
  
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
    issues
  };
};
