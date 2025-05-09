
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import useSecurityManagement from '@/hooks/useSecurityManagement';
import AuditLogsTable from '@/components/dashboard-users/AuditLogsTable';
import DashboardUserHeader from '@/components/dashboard-users/DashboardUserHeader';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const SecurityManagement = () => {
  const {
    dashboardUsers,
    isLoading,
    isRefreshing,
    activeTab,
    setActiveTab,
    auditLogs,
    formatDate,
    refreshData,
    lastRefresh,
    error,
  } = useSecurityManagement();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <AdminLayout title="Security Management" requiredPermission="access:security">
      <DashboardUserHeader 
        title="Security Management"
        subtitle="Manage dashboard users and view audit logs"
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
        lastRefresh={lastRefresh}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none px-4 h-12">
                <TabsTrigger value="users" className="data-[state=active]:border-b-2 data-[state=active]:border-yulu-blue rounded-none h-full">
                  Dashboard Users ({dashboardUsers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:border-b-2 data-[state=active]:border-yulu-blue rounded-none h-full">
                  Audit Logs
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users" className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
                </div>
              ) : dashboardUsers?.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No dashboard users found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Add your first dashboard user to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Manager</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.employee_id}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.city || '—'}</TableCell>
                          <TableCell>{user.cluster || '—'}</TableCell>
                          <TableCell>{user.manager || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs" className="p-0">
              <AuditLogsTable 
                auditLogs={auditLogs} 
                formatDate={formatDate}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default SecurityManagement;
