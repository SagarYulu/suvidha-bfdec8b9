
import React from 'react';
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

  // Create a wrapper that adapts the return type for UserPermissionsTable
  const handleTogglePermission = async (userId: string, permissionId: string): Promise<void> => {
    try {
      await togglePermission(userId, permissionId);
    } catch (error) {
      // Error is already handled in togglePermission
      console.error("Permission toggle failed:", error);
    }
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
