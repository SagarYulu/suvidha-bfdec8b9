import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserPermissionsTable from '@/components/dashboard-users/UserPermissionsTable';
import AuditLogsTable from '@/components/dashboard-users/AuditLogsTable';
import useSecurityManagement from '@/hooks/useSecurityManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SecurityManagement: React.FC = () => {
  const {
    dashboardUsers,
    permissions,
    isLoading,
    activeTab,
    setActiveTab,
    auditLogs,
    formatDate,
    hasPermission,
    togglePermission
  } = useSecurityManagement();
  
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Ensure user is authenticated and has admin role
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/admin/login');
    } else if (authState.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You must have admin privileges to access this page",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [authState, navigate]);

  // Create a wrapper that adapts the return type for UserPermissionsTable
  const handleTogglePermission = async (userId: string, permissionId: string): Promise<void> => {
    try {
      await togglePermission(userId, permissionId);
    } catch (error) {
      // Error is already handled in togglePermission
      console.error("Permission toggle failed:", error);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <AdminLayout title="Security Management">
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be logged in to access the security management page.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

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
                <UserPermissionsTable
                  dashboardUsers={dashboardUsers}
                  permissions={permissions}
                  isLoading={isLoading}
                  hasPermission={hasPermission}
                  togglePermission={handleTogglePermission}
                />
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
                <AuditLogsTable
                  auditLogs={auditLogs}
                  isLoading={isLoading}
                  formatDate={formatDate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SecurityManagement;
