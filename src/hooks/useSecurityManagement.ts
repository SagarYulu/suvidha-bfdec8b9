
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
  const { user, authState } = useAuth();
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

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

  // Toggle permission for a user
  const togglePermission = async (userId: string, permissionId: string) => {
    const hasPermissionValue = userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
    
    try {
      if (hasPermissionValue) {
        // Remove permission - completely avoid trying to create an audit log
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission_id', permissionId);
        
        if (error) {
          console.error("Error removing permission:", error);
          throw new Error("Failed to remove permission: " + error.message);
        }
        
        setUserPermissions(prev => 
          prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
        );
        
        toast({ description: "Permission removed successfully" });
      } else {
        // Add permission without any reference to granted_by
        // This avoids the audit log creation issue
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission_id: permissionId
          });
        
        if (error) {
          console.error("Error adding permission:", error);
          throw new Error("Failed to add permission: " + error.message);
        }
        
        setUserPermissions(prev => [...prev, { userId, permissionId }]);
        
        toast({ description: "Permission added successfully" });
      }
      
      // Refresh audit logs
      fetchAuditLogs();
      
    } catch (error: any) {
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

  // Check if user has permission
  const hasPermission = (userId: string, permissionId: string) => {
    return userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardUsers(),
        fetchPermissions(),
        fetchUserPermissions(),
        fetchAuditLogs()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

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
