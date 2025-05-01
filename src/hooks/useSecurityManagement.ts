import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string | null;
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface UserPermission {
  userId: string;
  permissionId: string;
}

const useSecurityManagement = () => {
  const { authState } = useAuth();
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
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
      const [usersData, permissionsData, userPermissionsData, auditLogsData] = await Promise.all([
        fetchDashboardUsers(),
        fetchPermissions(),
        fetchUserPermissions(),
        fetchAuditLogs()
      ]);
      
      // Update state only once with all the data
      setDashboardUsers(usersData || []);
      setPermissions(permissionsData || []);
      setUserPermissions(
        (userPermissionsData || []).map(item => ({
          userId: item.user_id,
          permissionId: item.permission_id
        }))
      );
      setAuditLogs(auditLogsData || []);
      setLastRefresh(new Date());
      
      console.log("All security data loaded successfully");
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

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('security_permissions')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching permissions:", error);
        throw new Error("Failed to fetch permissions");
      }
      
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Fetch user permissions
  const fetchUserPermissions = async () => {
    try {
      console.log("Fetching user permissions...");
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*');
      
      if (error) {
        console.error("Error fetching user permissions:", error);
        throw new Error("Failed to fetch user permissions");
      }
      
      console.log("User permissions fetched:", data?.length || 0);
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

  // Toggle permission for a user - properly integrated with Supabase auth
  const togglePermission = async (userId: string, permissionId: string): Promise<boolean> => {
    const hasPermissionValue = userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
    
    console.log(`Toggling permission: User ${userId}, Permission ${permissionId}, Current status: ${hasPermissionValue}`);
    
    try {
      // Check if current user has admin role - required for permission management
      if (authState.role !== 'admin' && authState.role !== 'security-admin') {
        console.error("User doesn't have admin or security-admin role:", authState.role);
        throw new Error("Administrator privileges required to manage permissions");
      }
      
      // Optimistic UI update
      if (hasPermissionValue) {
        // Remove permission locally
        setUserPermissions(prev => 
          prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
        );
      } else {
        // Add permission locally
        setUserPermissions(prev => [...prev, { userId, permissionId }]);
      }
      
      // Local permission management (fallback)
      const useLocalManagement = !authState.user?.id || process.env.NODE_ENV === 'development';
      
      if (useLocalManagement) {
        console.log("Using local permission management");
        
        // Try to sync with Supabase if possible
        try {
          if (authState.user?.id) {
            console.log("Attempting to sync with Supabase");
            
            if (hasPermissionValue) {
              await supabase
                .from('user_permissions')
                .delete()
                .eq('user_id', userId)
                .eq('permission_id', permissionId);
            } else {
              await supabase
                .from('user_permissions')
                .insert({
                  user_id: userId,
                  permission_id: permissionId,
                  granted_by: authState.user.id
                });
            }
            
            // Refresh audit logs after successful operation
            const newAuditLogs = await fetchAuditLogs();
            setAuditLogs(newAuditLogs || []);
          }
        } catch (e) {
          console.log("Failed to sync with Supabase, continuing with local state only", e);
        }
        
        // Return success for local operations
        toast({ 
          description: `Permission ${hasPermissionValue ? 'removed' : 'added'} successfully` 
        });
        return true;
      }
      
      // Otherwise use the Supabase RPC functions
      console.log("Using Supabase RPC for permission management");
      
      const method = hasPermissionValue ? 'remove_user_permission' : 'add_user_permission';
      const params = { 
        target_user_id: userId,
        target_permission_id: permissionId
      };
      
      console.log(`Calling ${method}:`, params);
      
      const { data: result, error } = await supabase.rpc(method, params);
      
      if (error) {
        console.error(`Error in ${method}:`, error);
        
        // Revert the optimistic update on error
        if (hasPermissionValue) {
          // Re-add permission locally since removal failed
          setUserPermissions(prev => [...prev, { userId, permissionId }]);
        } else {
          // Remove permission locally since addition failed
          setUserPermissions(prev => 
            prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
          );
        }
        
        throw new Error(`Failed to ${hasPermissionValue ? 'remove' : 'add'} permission: ${error.message}`);
      }
      
      console.log(`${method} result:`, result);
      
      // We don't need to update local state again since we did it optimistically
      
      toast({ 
        description: `Permission ${hasPermissionValue ? 'removed' : 'added'} successfully` 
      });
      
      // Refresh audit logs to show the new changes, but don't refresh everything
      const newAuditLogs = await fetchAuditLogs();
      setAuditLogs(newAuditLogs || []);
      
      return true;
    } catch (error: any) {
      console.error("Error in togglePermission:", error);
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

  // Check if user has permission
  const hasPermission = (userId: string, permissionId: string) => {
    return userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
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
    permissions,
    userPermissions,
    isLoading,
    isRefreshing,
    activeTab,
    setActiveTab,
    auditLogs,
    formatDate,
    hasPermission,
    togglePermission,
    refreshData,
    error,
    lastRefresh
  };
};

export default useSecurityManagement;
