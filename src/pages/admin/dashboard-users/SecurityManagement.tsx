
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import AdminLayout from '@/components/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

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

const SecurityManagement: React.FC = () => {
  const { user } = useAuth();
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
    const hasPermission = userPermissions.some(
      p => p.userId === userId && p.permissionId === permissionId
    );
    
    try {
      if (hasPermission) {
        // Remove permission
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission_id', permissionId);
        
        if (error) {
          console.error("Error removing permission:", error);
          toast({
            title: "Error",
            description: "Failed to remove permission",
            variant: "destructive"
          });
          return;
        }
        
        setUserPermissions(prev => 
          prev.filter(p => !(p.userId === userId && p.permissionId === permissionId))
        );
        
        toast({ description: "Permission removed successfully" });
      } else {
        // Add permission
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission_id: permissionId,
            granted_by: user?.id
          });
        
        if (error) {
          console.error("Error adding permission:", error);
          toast({
            title: "Error",
            description: "Failed to add permission",
            variant: "destructive"
          });
          return;
        }
        
        setUserPermissions(prev => [...prev, { userId, permissionId }]);
        
        toast({ description: "Permission added successfully" });
      }
      
      // Refresh audit logs
      fetchAuditLogs();
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
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

  return (
    <AdminLayout title="Security Management">
      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Permissions</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard User Permissions</CardTitle>
                <CardDescription>
                  Manage permissions for dashboard users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">Loading...</div>
                ) : dashboardUsers.length === 0 ? (
                  <div className="text-center py-10">No dashboard users found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          {permissions.map(permission => (
                            <TableHead key={permission.id}>
                              {permission.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            {permissions.map(permission => (
                              <TableCell key={`${user.id}-${permission.id}`}>
                                <Checkbox 
                                  checked={hasPermission(user.id, permission.id)}
                                  onCheckedChange={() => togglePermission(user.id, permission.id)}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Security Audit Logs</CardTitle>
                <CardDescription>
                  View history of changes to dashboard users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">Loading...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-10">No audit logs found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity Type</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>{formatDate(log.performed_at)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  log.action === 'create' ? 'success' :
                                  log.action === 'delete' ? 'destructive' :
                                  'outline'
                                }
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.entity_type}</TableCell>
                            <TableCell>
                              <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md max-h-24 overflow-auto">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SecurityManagement;
