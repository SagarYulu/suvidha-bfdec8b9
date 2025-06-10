
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { DashboardMetrics, Issue, Analytics } from '../types';

export const useDashboardData = () => {
  const [analytics, setAnalytics] = useState<DashboardMetrics | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [metricsResponse, issuesResponse, usersResponse] = await Promise.all([
          apiService.getDashboardMetrics(),
          apiService.getIssues({ limit: 10, sort: 'created_at', order: 'desc' }),
          apiService.getUsers({ limit: 1 })
        ]);

        if (metricsResponse.success) {
          setAnalytics(metricsResponse.data);
        }

        if (issuesResponse.success) {
          setRecentIssues(issuesResponse.data);
        }

        if (usersResponse.success && usersResponse.pagination) {
          setUserCount(usersResponse.pagination.total);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Process data for charts
  const typePieData = analytics ? 
    Object.entries(analytics).filter(([key]) => key.includes('Issues')).map(([key, value]) => ({
      name: key.replace('Issues', '').replace(/([A-Z])/g, ' $1').trim(),
      value: value as number
    })) : [];

  const cityBarData = recentIssues.reduce((acc: any[], issue) => {
    const existing = acc.find(item => item.city === issue.city);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ city: issue.city, count: 1 });
    }
    return acc;
  }, []);

  return {
    analytics,
    recentIssues,
    isLoading,
    userCount,
    handleFilterChange,
    typePieData,
    cityBarData,
    filters
  };
};
