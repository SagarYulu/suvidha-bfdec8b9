import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldCheck, ShieldX, AlertTriangle, RefreshCw, KeyRound, Lock, Settings, UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardUser } from "@/types/dashboardUsers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DASHBOARD_USER_ROLES } from "@/data/formOptions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRBAC } from "@/contexts/RBACContext";
import RolePermissionsManager from "@/components/rbac/RolePermissionsManager";
import { checkUserRole, assignRole, removeRole } from "@/services/roleService";

const AccessControl = () => {
  // Original state for user management
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // New state for tab management
  const [activeTab, setActiveTab] = useState("users");
  
  const { authState } = useAuth();
  const { userRole, refreshPermissions } = useRBAC();
  const navigate = useNavigate();

  // Check if current user is developer account
  const isDeveloperAccount = authState.user?.email === 'sagar.km@yulu.bike';

  // Check if current user is admin
  useEffect(() => {
    if (!authState.isAuthenticated) {
      console.log("Not authenticated in AccessControl page, redirecting to login");
      navigate("/admin/login");
      return;
    }

    // Special access for developer account
    if (isDeveloperAccount) {
      console.log("Developer account detected - granting full access");
      loadDashboardUsers();
      return;
    }

    // Allow both admin and security-admin roles to access this page
    if (authState.role !== "admin" && authState.role !== "security-admin") {
      console.log("Access denied: User role =", authState.role);
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive",
      });
      navigate("/admin/dashboard");
      return;
    }

    console.log("User authorized for access control page:", authState.user?.name);
    loadDashboardUsers();
  }, [authState, navigate, isDeveloperAccount]);

  const loadDashboardUsers = async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('dashboard_users')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setDashboardUsers(users || []);
      
      // Check each user's role
      const adminIds = new Set<string>();
      for (const user of users || []) {
        // Determine the ID to use for role checking - prefer user_id if it's a valid UUID
        const idToCheck = (user.user_id && isValidUuid(user.user_id)) ? user.user_id : user.id;
        
        if (await checkUserRole(idToCheck, "Super Admin")) {
          adminIds.add(user.id);
        }
      }
      setAdminUserIds(adminIds);
    } catch (error) {
      console.error("Error loading dashboard users:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: DashboardUser) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setErrorMessage(null);
    setDialogOpen(true);
  };

  const isValidUuid = (id: string): boolean => {
    // UUID validation pattern
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || selectedRole === selectedUser.role) {
      setDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    
    try {
      // Get the current authenticated user ID 
      if (!authState.user?.id) {
        throw new Error("User ID not available. Please log in again.");
      }

      console.log("Updating role for user:", selectedUser.id);
      console.log("New role:", selectedRole);
      console.log("Current user role:", authState.role);
      
      // First, update the dashboard_users table
      const { error: dashboardUpdateError } = await supabase
        .from('dashboard_users')
        .update({ 
          role: selectedRole,
          last_updated_by: authState.user?.id
        })
        .eq('id', selectedUser.id);
      
      if (dashboardUpdateError) {
        console.error("Supabase dashboard_users update error:", dashboardUpdateError);
        throw dashboardUpdateError;
      }
      
      // Determine which ID to use for RBAC role assignment:
      // 1. If user.user_id exists and is a valid UUID, use that
      // 2. Otherwise use the user.id if it's a valid UUID
      const userIdForRoles = (selectedUser.user_id && isValidUuid(selectedUser.user_id)) 
        ? selectedUser.user_id 
        : (isValidUuid(selectedUser.id) ? selectedUser.id : null);
      
      console.log("Using ID for role assignment:", userIdForRoles);
      
      // Only try RBAC role assignment if we have a valid UUID
      if (userIdForRoles) {
        // Remove all existing roles first (clean slate)
        if (selectedUser.role) {
          const removeResult = await removeRole(userIdForRoles, selectedUser.role);
          console.log("Remove role result:", removeResult);
        }
        
        // Assign new role
        const assignResult = await assignRole(userIdForRoles, selectedRole);
        console.log("Assign role result:", assignResult);
        
        if (!assignResult) {
          console.warn("RBAC role assignment may have failed, but dashboard user was updated");
        }
      } else {
        console.log("No valid UUID for role assignment in RBAC system - skipping RBAC update");
      }
      
      // Update the local state regardless of RBAC result
      setDashboardUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: selectedRole } 
            : user
        )
      );
      
      // Update admin user IDs set
      if (selectedRole === "Super Admin") {
        setAdminUserIds(prev => new Set(prev).add(selectedUser.id));
      } else {
        setAdminUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedUser.id);
          return newSet;
        });
      }
      
      // Refresh the permissions to ensure the UI reflects the changes
      await refreshPermissions();
      
      toast({
        title: "Success",
        description: `Role updated to ${selectedRole} for ${selectedUser.name}`,
      });
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating role:", error);
      setErrorMessage(error.message || "Failed to update user role");
      toast({
        title: "Error",
        description: `Failed to update user role: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setErrorMessage(null);
  };

  // Add a new function to initialize permissions
  const initializePermissions = useCallback(async () => {
    try {
      // Import the function dynamically to avoid circular dependencies
      const { ensurePermissionsExist } = await import('@/services/rbacService');
      await ensurePermissionsExist();
      toast({
        title: "Permissions Initialized",
        description: "All required permissions have been added to the database",
      });
      // Refresh permissions cache after initialization
      await refreshPermissions();
    } catch (error) {
      console.error("Error initializing permissions:", error);
      toast({
        title: "Error",
        description: "Failed to initialize permissions",
        variant: "destructive",
      });
    }
  }, [refreshPermissions]);

  return (
    <AdminLayout title="Access Control">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Access Control & Permissions</h2>
            <p className="text-muted-foreground">Manage user roles and configure system permissions</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => loadDashboardUsers()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={initializePermissions} variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Initialize Permissions
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="mr-2 h-4 w-4" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="info">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Developer Info
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Admin Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardUsers.length > 0 ? (
                      dashboardUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.employee_id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell>{user.city || '-'}</TableCell>
                          <TableCell>{user.cluster || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === "Super Admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {adminUserIds.has(user.id) ? (
                              <div className="flex items-center text-green-600">
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                <span>Yes</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <ShieldX className="w-4 h-4 mr-1" />
                                <span>No</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRoleChange(user)}
                            >
                              Change Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6">
                          No dashboard users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-4">
            <RolePermissionsManager />
          </TabsContent>
          
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Developer Guide to RBAC System</CardTitle>
                <CardDescription>
                  How to modify and extend the role-based access control system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Database-Backed RBAC System</h3>
                  <p>
                    This application uses a database-backed RBAC system where permissions and roles
                    are stored in the database rather than hardcoded in the application. This allows
                    for dynamic permission management through the UI.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">RBAC System Files</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><code>src/services/rbacService.ts</code> - API functions for RBAC operations</li>
                    <li><code>src/contexts/RBACContext.tsx</code> - Core RBAC configuration, defines permission types</li>
                    <li><code>src/hooks/useRoleAccess.tsx</code> - Hook for checking permissions with redirects</li>
                    <li><code>src/components/guards/RoleBasedGuard.tsx</code> - Route protection component</li>
                    <li><code>src/components/rbac/PermissionGate.tsx</code> - Component for conditional UI rendering</li>
                    <li><code>src/components/rbac/RolePermissionsManager.tsx</code> - UI for managing role permissions</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">How to Add New Permissions</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Insert the permission in the database table <code>rbac_permissions</code></li>
                    <li>Add the new permission type to <code>Permission</code> type in <code>RBACContext.tsx</code></li>
                    <li>Assign the permission to appropriate roles through the UI</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Special Accounts</h3>
                  <p>The email <code>sagar.km@yulu.bike</code> is configured as a developer account with full access to all features regardless of assigned role.</p>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Role-Based Permissions</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Changes to role permissions take effect immediately for all users with that role.
                          Remember that Super Admin users always have all permissions by default.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Original role change dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.name}. Current role: <strong>{selectedUser?.role}</strong>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {DASHBOARD_USER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedRole === "Super Admin" && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Super Admin users have complete access to the admin dashboard,
                        including all security permissions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRoleChange}
                disabled={selectedRole === selectedUser?.role || isUpdating}
                className={isUpdating ? "opacity-70 cursor-not-allowed" : ""}
              >
                {isUpdating ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AccessControl;
