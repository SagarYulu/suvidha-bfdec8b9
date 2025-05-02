
import { useState, useEffect, useCallback } from 'react';
import { getAnalytics, getIssues, IssueFilters } from "@/services/issueService";
import { getUsers } from "@/services/userService";
import { Issue } from "@/types";

export const useDashboardData = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
  // Memoize the filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback((newFilters: IssueFilters) => {
    setFilters(newFilters);
  }, []);

  // Prepare chart data
  const typePieData = analytics && analytics.typeCounts ? 
    Object.entries(analytics.typeCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    })) : [];

  const cityBarData = analytics && analytics.cityCounts ? 
    Object.entries(analytics.cityCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    })) : [];

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch analytics and issues data in parallel to speed up loading
        const [analyticsData, issues, users] = await Promise.all([
          getAnalytics(filters),
          getIssues(filters),
          getUsers()
        ]);
        
        setAnalytics(analyticsData);
        
        const sortedIssues = [...issues].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentIssues(sortedIssues.slice(0, 5));
        
        setUserCount(users.filter(user => user.role === "employee").length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

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
