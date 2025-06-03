
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { toast } from './use-toast';
import { useAuth } from '../contexts/AuthContext';
import { DashboardUser } from '../types/dashboardUsers';

const useSecurityManagement = () => {
  const { user } = useAuth();
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!user) {
      console.log("User not authenticated, skipping data fetch");
      return;
    }

    if (isRefreshing) {
      console.log("Already refreshing data, skipping duplicate fetch");
      return;
    }

    setIsRefreshing(true);
    setError(null);
    
    try {
      console.log("Fetching security management data...");
      
      const [usersData, auditLogsData] = await Promise.all([
        fetchDashboardUsers(),
        fetchAuditLogs()
      ]);
      
      setDashboardUsers(usersData || []);
      setAuditLogs(auditLogsData || []);
      setLastRefresh(new Date());
      
      console.log("Security data loaded successfully");
    } catch (error: any) {
      console.error("Error loading security management data:", error);
      setError(error.message || "Failed to load security management data");
      toast({
        title: "Error",
        description: "Failed to load security management data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isRefreshing]);

  useEffect(() => {
    if (user && !isRefreshing) {
      console.log("Initial data load");
      setIsLoading(true);
      fetchData();
    }
  }, [user, fetchData]);

  const fetchDashboardUsers = async () => {
    try {
      console.log("Fetching dashboard users...");
      const response = await api.get('/dashboard-users');
      console.log("Dashboard users fetched:", response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/audit-logs?limit=50');
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const refreshData = async () => {
    if (isRefreshing) {
      console.log("Already refreshing data, skipping duplicate refresh request");
      return;
    }
    
    console.log("Manual refresh requested");
    setIsLoading(true);
    await fetchData();
    
    toast({
      description: "Security data refreshed successfully"
    });
  };

  return {
    dashboardUsers,
    isLoading,
    isRefreshing,
    activeTab,
    setActiveTab,
    auditLogs,
    formatDate,
    refreshData,
    error,
    lastRefresh
  };
};

export default useSecurityManagement;
