
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from "@/services/api/analyticsService";
import { getIssues, IssueFilters } from "@/services/issues/issueFilters";
import { getUsers } from "@/services/api/userService";
import { toast } from "@/hooks/use-toast";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  const { 
    data: users = [], 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
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

  useEffect(() => {
    if (issuesError) {
      console.error("Error fetching issues:", issuesError);
      toast({
        title: "Error",
        description: "Failed to load issues data",
        variant: "destructive",
      });
    }
    
    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
      toast({
        title: "Error", 
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    }
  }, [issuesError, analyticsError]);
  
  const recentIssues = useMemo(() => {
    const sortedIssues = [...issues].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedIssues.slice(0, 5);
  }, [issues]);
  
  const userCount = useMemo(() => {
    return users.filter(user => user.role === "employee").length;
  }, [users]);
  
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
  
  const handleFilterChange = useCallback((newFilters: IssueFilters) => {
    console.log("Filter change requested:", newFilters);
    
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      if ('city' in newFilters) {
        updatedFilters.city = newFilters.city;
        if (newFilters.city !== prevFilters.city) {
          updatedFilters.cluster = null;
        }
      }
      
      if ('cluster' in newFilters) {
        updatedFilters.cluster = newFilters.cluster;
      }
      
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
