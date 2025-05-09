
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardUser } from '@/types/dashboardUsers';

const useSecurityManagement = () => {
  const { authState } = useAuth();
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Fetch dashboard users data - ONLY from dashboard_users table
  const fetchData = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setError(null);
    
    try {      
      console.log("Fetching dashboard users only from dashboard_users table");
      // Load dashboard users and audit logs in parallel
      const [dashboardUsersData, auditLogsData] = await Promise.all([
        fetchDashboardUsers(),
        fetchAuditLogs()
      ]);
      
      setDashboardUsers(dashboardUsersData || []);
      setAuditLogs(auditLogsData || []);
      setLastRefresh(new Date());
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
  }, [authState.isAuthenticated, isRefreshing]);

  // Initial data load
  useEffect(() => {
    if (authState.isAuthenticated && !isRefreshing) {
      setIsLoading(true);
      fetchData();
    }
  }, [authState.isAuthenticated, fetchData]);

  // Fetch ONLY dashboard users - this is completely separate from regular users
  const fetchDashboardUsers = async (): Promise<DashboardUser[]> => {
    try {
      console.log("Fetching exclusively from dashboard_users table");
      
      // ONLY query the dashboard_users table, never query from employees table
      const { data, error } = await supabase
        .from('dashboard_users')
        .select('*')
        .order('name');
      
      if (error) {
        throw new Error(`Failed to fetch dashboard users: ${error.message}`);
      }
      
      console.log(`Retrieved ${data?.length || 0} dashboard users from dashboard_users table`);
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data as DashboardUser[];
    } catch (error) {
      console.error("Error in fetchDashboardUsers:", error);
      throw error;
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_user_audit_logs')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(50);
      
      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error("Error in fetchAuditLogs:", error);
      throw error;
    }
  };

  // Format date for display
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

  // Refresh all data
  const refreshData = async () => {
    if (isRefreshing) {
      return;
    }
    
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
