
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
import { ShieldAlert, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// List of authorized emails that can access the security management page
const AUTHORIZED_EMAILS = ['admin@yulu.com', 'sagar.km@yulu.bike'];

const SecurityManagement: React.FC = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isSessionRefreshing, setIsSessionRefreshing] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0); // Used to force re-fetch
  const navigate = useNavigate();
  const { authState, refreshAuth } = useAuth();
  
  // Always call the hook, regardless of auth state
  const securityManagement = useSecurityManagement();
  
  // Handle manual session refresh and data refresh
  const handleRefreshSession = async () => {
    setIsSessionRefreshing(true);
    setError(null);
    
    try {
      // First try to refresh local auth
      await refreshAuth();
      
      // Then try to refresh Supabase session
      const { data, error } = await supabase.auth.refreshSession();
      console.log("Session refresh attempt:", data, error);
      
      if (error) {
        console.error("Failed to refresh Supabase session:", error);
        
        // If we failed to refresh but have local auth, just continue
        if (authState.isAuthenticated) {
          toast({
            description: "Using local authentication",
          });
          setSessionChecked(true);
          setIsAuthChecking(false);
        } else {
          setError("Session refresh failed. Please log in again.");
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue",
            variant: "destructive"
          });
        }
      } else {
        console.log("Successfully refreshed Supabase session");
        toast({
          description: "Session refreshed successfully",
        });
        setSessionChecked(true);
        setIsAuthChecking(false);
        
        // After successful auth refresh, also refresh the data
        setDataRefreshKey(prev => prev + 1);
        if (securityManagement.refreshData) {
          await securityManagement.refreshData();
        }
      }
    } catch (e) {
      console.error("Error during refresh:", e);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSessionRefreshing(false);
    }
  };
  
  // Force data refresh without session refresh
  const handleDataRefresh = async () => {
    if (securityManagement.refreshData) {
      await securityManagement.refreshData();
    }
  };
  
  // Simplified session check on mount - just check if we have auth and move forward
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Simple check if we're authenticated locally
        if (authState.isAuthenticated) {
          console.log("User is already authenticated locally:", authState.user?.email);
          setSessionChecked(true);
          setIsAuthChecking(false);
        } else {
          // Try refreshing auth once on mount
          await refreshAuth();
          
          // Check again after refresh
          if (authState.isAuthenticated) {
            console.log("Authentication restored after refresh");
            setSessionChecked(true);
            setIsAuthChecking(false);
          } else {
            setError("Authentication required. Please log in.");
            console.log("User is not authenticated after refresh attempt");
          }
        }
      } catch (e) {
        console.error("Error checking session:", e);
      } finally {
        // Always mark session as checked to avoid infinite loading
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [authState.isAuthenticated, authState.user?.email, refreshAuth]);
  
  // Check authentication first before loading data
  useEffect(() => {
    if (!sessionChecked) return; // Wait until session is checked
    
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
  }, [authState, navigate, sessionChecked]);
  
  // Effect to refresh data if the key changes
  useEffect(() => {
    if (securityManagement.refreshData && authState.isAuthenticated && !isAuthChecking) {
      securityManagement.refreshData();
    }
  }, [dataRefreshKey, authState.isAuthenticated, isAuthChecking]);
  
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
          <div className="mt-4 flex gap-3">
            <Button 
              onClick={handleRefreshSession}
              disabled={isSessionRefreshing}
            >
              {isSessionRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/login')}>
              Go to Login
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
    togglePermission,
  } = securityManagement || {};

  // Create a wrapper that adapts the return type for UserPermissionsTable
  const handleTogglePermission = async (userId: string, permissionId: string): Promise<void> => {
    try {
      if (togglePermission) {
        await togglePermission(userId, permissionId);
        // Refresh is handled in togglePermission function now
        console.log("Permission toggled, data should be refreshed");
      }
    } catch (error) {
      console.error("Permission toggle failed:", error);
      throw error; // Re-throw to let UserPermissionTable handle the error
    }
  };

  return (
    <AdminLayout title="Security Management">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Security Management</h1>
          <Button 
            onClick={handleDataRefresh}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
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
