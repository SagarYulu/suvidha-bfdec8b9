
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from "@/services/issues/issueAnalyticsService";
import { getIssues, IssueFilters } from "@/services/issues/issueFilters";
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

  // This will help us map employees to cities and clusters for filtering
  const [employeeUuidsByFilter, setEmployeeUuidsByFilter] = useState<string[]>([]);
  
  // Effect to determine which employee UUIDs match the current filters
  useEffect(() => {
    const fetchEmployeeUuids = async () => {
      // Only fetch if we have city or cluster filters
      if (filters.city || filters.cluster) {
        try {
          const allUsers = await getUsers();
          const filteredUuids = allUsers
            .filter(user => {
              // Apply city filter
              if (filters.city && user.city !== filters.city) {
                return false;
              }
              // Apply cluster filter
              if (filters.cluster && user.cluster !== filters.cluster) {
                return false;
              }
              return true;
            })
            .map(user => user.id);
            
          console.log(`Filtered ${filteredUuids.length} employee UUIDs based on city/cluster filters`);
          setEmployeeUuidsByFilter(filteredUuids);
        } catch (error) {
          console.error("Error fetching employee UUIDs:", error);
          setEmployeeUuidsByFilter([]);
        }
      } else {
        // Clear the filter if no city/cluster filters
        setEmployeeUuidsByFilter([]);
      }
    };
    
    fetchEmployeeUuids();
  }, [filters.city, filters.cluster]);
  
  // Query for analytics data with proper caching - passing the filters
  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['analytics', filters, employeeUuidsByFilter],
    queryFn: async () => {
      console.log("Fetching analytics with filters:", filters);
      
      // Prepare analytics filters
      const analyticsFilters = {
        issueType: filters.issueType,
        employeeUuids: employeeUuidsByFilter.length > 0 ? employeeUuidsByFilter : undefined
      };
      
      console.log("Using analytics filters:", analyticsFilters);
      return getAnalytics(analyticsFilters);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
