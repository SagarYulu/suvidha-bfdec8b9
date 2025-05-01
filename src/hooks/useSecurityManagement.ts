
import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Don't use authStatus state since it causes the hook count to change
  // Only fetch data if user is authenticated
  useEffect(() => {
    if (!authState.isAuthenticated) {
      console.log("User not authenticated, skipping data fetch");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Authenticated user:", authState.user?.email);
        
        // Load data without requiring a valid Supabase session
        // This allows the mock user accounts to still access data
        await Promise.all([
          fetchDashboardUsers(),
          fetchPermissions(),
          fetchUserPermissions(),
          fetchAuditLogs()
        ]);
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
      }
    };
    
    loadData();
  }, [authState.isAuthenticated, authState.user?.email]);

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
        toast({
          title: "Error",
          description: "Failed to fetch dashboard users",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Dashboard users fetched:", data?.length || 0);
      setDashboardUsers(data || []);
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
        toast({
          title: "Error",
          description: "Failed to fetch permissions",
          variant: "destructive"
        });
        return;
      }
      
      setPermissions(data || []);
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
        toast({
          title: "Error",
          description: "Failed to fetch user permissions",
          variant: "destructive"
        });
        return;
      }
      
      console.log("User permissions fetched:", data?.length || 0, data);
      
      setUserPermissions(
        data.map(item => ({
          userId: item.user_id,
          permissionId: item.permission_id
        })) || []
      );
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
        toast({
          title: "Error",
          description: "Failed to fetch audit logs",
          variant: "destructive"
        });
        return;
      }
      
      setAuditLogs(data || []);
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
      
      // Local permission management (fallback)
      const useLocalManagement = !authState.user?.id || process.env.NODE_ENV === 'development';
      
      if (useLocalManagement) {
        console.log("Using local permission management");
        
        if (hasPermissionValue) {
          // Remove permission locally
          console.log("Removing permission locally");
          setUserPermissions(prev => 
            prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
          );
          
          // Try to sync with Supabase if possible
          try {
            if (authState.user?.id) {
              console.log("Attempting to sync local removal with Supabase");
              await supabase
                .from('user_permissions')
                .delete()
                .eq('user_id', userId)
                .eq('permission_id', permissionId);
            }
          } catch (e) {
            console.log("Failed to sync with Supabase, continuing with local state only", e);
          }
        } else {
          // Add permission locally
          console.log("Adding permission locally");
          setUserPermissions(prev => [...prev, { userId, permissionId }]);
          
          // Try to sync with Supabase if possible
          try {
            if (authState.user?.id) {
              console.log("Attempting to sync local addition with Supabase");
              await supabase
                .from('user_permissions')
                .insert({
                  user_id: userId,
                  permission_id: permissionId,
                  granted_by: authState.user.id
                });
            }
          } catch (e) {
            console.log("Failed to sync with Supabase, continuing with local state only", e);
          }
        }
        
        // Return success for local operations
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
        throw new Error(`Failed to ${hasPermissionValue ? 'remove' : 'add'} permission: ${error.message}`);
      }
      
      console.log(`${method} result:`, result);
      
      // Update local state if the operation succeeded
      if (result === true) {
        if (hasPermissionValue) {
          console.log("Removing permission from local state after successful Supabase operation");
          setUserPermissions(prev => 
            prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
          );
        } else {
          console.log("Adding permission to local state after successful Supabase operation");
          setUserPermissions(prev => [...prev, { userId, permissionId }]);
        }
        
        toast({ 
          description: `Permission ${hasPermissionValue ? 'removed' : 'added'} successfully` 
        });
        
        // Refresh audit logs to show the new changes
        await fetchAuditLogs();
      } else {
        throw new Error(`Failed to ${hasPermissionValue ? 'remove' : 'add'} permission`);
      }
      
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
    const hasPermissionValue = userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
    console.log(`Checking permission for user ${userId}, permission ${permissionId}: ${hasPermissionValue}`);
    return hasPermissionValue;
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing security management data...");
      await Promise.all([
        fetchDashboardUsers(),
        fetchPermissions(),
        fetchUserPermissions(),
        fetchAuditLogs()
      ]);
      console.log("Data refreshed successfully");
      toast({
        description: "Security data refreshed successfully"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardUsers,
    permissions,
    userPermissions,
    isLoading,
    activeTab,
    setActiveTab,
    auditLogs,
    formatDate,
    hasPermission,
    togglePermission,
    refreshData,
    error
  };
};

export default useSecurityManagement;
