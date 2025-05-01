
import React, { useEffect, useState } from 'react';
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
import { ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// List of authorized emails that can access the security management page
const AUTHORIZED_EMAILS = ['admin@yulu.com', 'sagar.km@yulu.bike'];

const SecurityManagement: React.FC = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  // Always call the hook, regardless of auth state
  const securityManagement = useSecurityManagement();
  
  // Check authentication first before loading data
  useEffect(() => {
    const checkAuth = async () => {
      // Short timeout to ensure auth state is loaded
      setTimeout(() => {
        if (!authState.isAuthenticated) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access security management",
            variant: "destructive"
          });
          navigate('/admin/login', { state: { returnTo: '/admin/dashboard-users/security' } });
        } else if (authState.role !== 'admin' && 
                   authState.role !== 'security-admin' && 
                   !AUTHORIZED_EMAILS.includes(authState.user?.email || '')) {
          // Check if user is admin OR has an authorized email OR has security-admin role
          toast({
            title: "Access Denied",
            description: "You must have admin privileges to access this page",
            variant: "destructive"
          });
          navigate('/admin');
        } else {
          console.log("User authorized to access security management:", authState.user?.email);
          setIsAuthChecking(false);
        }
      }, 500);
    };
    
    checkAuth();
  }, [authState, navigate]);
  
  if (isAuthChecking) {
    return (
      <AdminLayout title="Security Management">
        <div className="container mx-auto py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-lg">Checking authentication...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
          <div className="mt-4">
            <Button onClick={() => navigate('/admin/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout title="Security Management">
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
  } = securityManagement || {};

  // Create a wrapper that adapts the return type for UserPermissionsTable
  const handleTogglePermission = async (userId: string, permissionId: string): Promise<void> => {
    try {
      if (togglePermission) {
        await togglePermission(userId, permissionId);
      }
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
                  dashboardUsers={dashboardUsers || []}
                  permissions={permissions || []}
                  isLoading={isLoading || false}
                  hasPermission={hasPermission || (() => false)}
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
                  auditLogs={auditLogs || []}
                  isLoading={isLoading || false}
                  formatDate={formatDate || ((date: string) => date)}
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
