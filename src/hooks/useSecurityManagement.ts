
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
  
  // Don't use authStatus state since it causes the hook count to change
  // Only fetch data if user is authenticated
  useEffect(() => {
    if (!authState.isAuthenticated) {
      console.log("User not authenticated, skipping data fetch");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Make sure we have a valid Supabase session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.error("No valid Supabase session found");
          return;
        }

        console.log("User authenticated, session valid:", sessionData.session.user.id);
        
        await Promise.all([
          fetchDashboardUsers(),
          fetchPermissions(),
          fetchUserPermissions(),
          fetchAuditLogs()
        ]);
      } catch (error) {
        console.error("Error loading security management data:", error);
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
  }, [authState.isAuthenticated]);

  // Fetch dashboard users
  const fetchDashboardUsers = async () => {
    try {
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
      
      setDashboardUsers(data || []);
    } catch (error) {
      console.error("Error:", error);
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
    }
  };

  // Fetch user permissions
  const fetchUserPermissions = async () => {
    try {
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
      
      setUserPermissions(
        data.map(item => ({
          userId: item.user_id,
          permissionId: item.permission_id
        })) || []
      );
    } catch (error) {
      console.error("Error:", error);
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
    }
  };

  // Toggle permission for a user - properly integrated with Supabase auth
  const togglePermission = async (userId: string, permissionId: string): Promise<boolean> => {
    const hasPermissionValue = userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
    
    try {
      // Check if current user has admin role - required for permission management
      if (authState.role !== 'admin') {
        throw new Error("Administrator privileges required to manage permissions");
      }
      
      // IMPORTANT: Check for a valid session before making RPC calls
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Session error:", sessionError);
        toast({ 
          title: "Authentication Error", 
          description: "You must be logged in to manage permissions. Please log in again.",
          variant: "destructive" 
        });
        throw new Error("Not authenticated");
      }
      
      // We have a valid session, proceed with the RPC call
      console.log("Using authenticated session:", sessionData.session.user.id);
      
      if (hasPermissionValue) {
        // Use an RPC function to remove permission
        console.log("Attempting to remove permission:", { userId, permissionId });
        
        // Pass the session token in the Authorization header through default behavior
        const { data: result, error: roleError } = await supabase.rpc(
          'remove_user_permission',
          { 
            target_user_id: userId,
            target_permission_id: permissionId
          }
        );
        
        if (roleError) {
          console.error("Error removing permission:", roleError);
          throw new Error("Failed to remove permission: " + roleError.message);
        }
        
        // Update local state only if the operation succeeded
        if (result === true) {
          setUserPermissions(prev => 
            prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
          );
          
          toast({ description: "Permission removed successfully" });
        } else {
          throw new Error("Failed to remove permission");
        }
      } else {
        // Use an RPC function to add permission
        console.log("Attempting to add permission:", { userId, permissionId });
        
        // Pass the session token in the Authorization header through default behavior
        const { data: result, error: roleError } = await supabase.rpc(
          'add_user_permission',
          { 
            target_user_id: userId,
            target_permission_id: permissionId
          }
        );
        
        if (roleError) {
          console.error("Error adding permission:", roleError);
          throw new Error("Failed to add permission: " + roleError.message);
        }
        
        // Update local state only if the operation succeeded
        if (result === true) {
          setUserPermissions(prev => [...prev, { userId, permissionId }]);
          toast({ description: "Permission added successfully" });
        } else {
          throw new Error("Failed to add permission");
        }
      }
      
      // Refresh audit logs to show the new changes
      await fetchAuditLogs();
      
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
    togglePermission
  };
};

export default useSecurityManagement;
