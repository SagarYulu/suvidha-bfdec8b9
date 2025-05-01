
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string | null;
}

// Removed Permission interface that was causing issues

const useSecurityManagement = () => {
  const { authState } = useAuth();
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Debounced fetch to prevent multiple refreshes
  const fetchData = useCallback(async () => {
    if (!authState.isAuthenticated) {
      console.log("User not authenticated, skipping data fetch");
      return;
    }

    // If already refreshing, don't start another refresh
    if (isRefreshing) {
      console.log("Already refreshing data, skipping duplicate fetch");
      return;
    }

    setIsRefreshing(true);
    setError(null);
    
    try {
      console.log("Fetching security management data...");
      
      // Load all data in parallel
      const [usersData, auditLogsData] = await Promise.all([
        fetchDashboardUsers(),
        fetchAuditLogs()
      ]);
      
      // Update state only once with all the data
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
  }, [authState.isAuthenticated, isRefreshing]);

  // Initial data load when component mounts
  useEffect(() => {
    // Only fetch when authenticated and not already loading
    if (authState.isAuthenticated && !isRefreshing) {
      console.log("Initial data load");
      setIsLoading(true);
      fetchData();
    }
  }, [authState.isAuthenticated, fetchData]);

  // Fetch dashboard users
  const fetchDashboardUsers = async () => {
    try {
      console.log("Fetching dashboard users...");
      const { data, error } = await supabase
        .from('dashboard_users')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching dashboard users:", error);
        throw new Error("Failed to fetch dashboard users");
      }
      
      console.log("Dashboard users fetched:", data?.length || 0);
      return data;
    } catch (error) {
      console.error("Error:", error);
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
        console.error("Error fetching audit logs:", error);
        throw new Error("Failed to fetch audit logs");
      }
      
      return data;
    } catch (error) {
      console.error("Error:", error);
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

  // Refresh all data - with debounce protection
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
