
import { useState, useEffect } from "react";
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
import { Permission, useRBAC } from "@/contexts/RBACContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Helper type for role permissions display
interface RolePermissionMapping {
  role: string;
  permissions: Permission[];
  description: string;
}

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
  
  // New state for RBAC configuration management
  const [activeTab, setActiveTab] = useState("users");
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMapping[]>([]);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<string | null>(null);
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  
  const { authState } = useAuth();
  const { userRole, hasPermission } = useRBAC();
  const navigate = useNavigate();

  // Check if current user is developer account
  const isDeveloperAccount = authState.user?.email === 'sagar.km@yulu.bike';

  // Initialize role permissions mapping based on the current RBAC context
  useEffect(() => {
    // Define the role-permission mappings from RBACContext
    const mappings: RolePermissionMapping[] = [
      {
        role: "admin",
        permissions: [
          'view:dashboard',
          'manage:users',
          'manage:issues',
          'manage:analytics',
          'manage:settings',
          'access:security',
          'create:dashboardUser'
        ],
        description: "Administrators have full access to all features"
      },
      {
        role: "security-admin",
        permissions: [
          'view:dashboard',
          'manage:users',
          'manage:issues',
          'manage:analytics',
          'manage:settings',
          'access:security',
          'create:dashboardUser'
        ],
        description: "Security admins have access to security features and user management"
      },
      {
        role: "Super Admin",
        permissions: [
          'view:dashboard',
          'manage:users',
          'manage:issues',
          'manage:analytics',
          'manage:settings',
          'access:security',
          'create:dashboardUser'
        ],
        description: "Super Admins have full system access"
      },
      {
        role: "employee",
        permissions: ['manage:issues'],
        description: "Employees can manage issues only"
      },
      {
        role: "default",
        permissions: [],
        description: "Default role with no special permissions"
      }
    ];

    setRolePermissions(mappings);
  }, []);

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
        if (user.role === "Super Admin") {
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
      
      // Check if the user ID is a valid UUID (for database users)
      const validUuid = isValidUuid(selectedUser.id);
      
      if (!validUuid) {
        console.log("Non-UUID user ID detected:", selectedUser.id);
        // For non-UUID users, just update the local state without database update
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
        
        toast({
          title: "Success",
          description: `Role updated to ${selectedRole} for ${selectedUser.name}`,
        });
      } else {
        // For UUID users, update the database
        const { error } = await supabase
          .from('dashboard_users')
          .update({ 
            role: selectedRole,
            last_updated_by: authState.user?.id
          })
          .eq('id', selectedUser.id);
        
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        // Update the local state
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
        
        toast({
          title: "Success",
          description: `Role updated to ${selectedRole} for ${selectedUser.name}`,
        });
      }
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
      setDialogOpen(false);
    }
  };

  // New function to handle role configuration
  const handleRoleConfigChange = (role: string) => {
    setSelectedRoleConfig(role);
    setConfigDialogOpen(true);
  };

  // Toggle permission for role (Note: In a real app, this would update database/backend)
  const togglePermissionForRole = (role: string, permission: Permission) => {
    // For demonstration only - in a full implementation this would update database
    setRolePermissions(prevRoles => 
      prevRoles.map(r => {
        if (r.role === role) {
          if (r.permissions.includes(permission)) {
            return {
              ...r,
              permissions: r.permissions.filter(p => p !== permission)
            };
          } else {
            return {
              ...r,
              permissions: [...r.permissions, permission]
            };
          }
        }
        return r;
      })
    );
    setPermissionsChanged(true);
    
    toast({
      title: "For Demonstration Only",
      description: "In a production app, this would update the permission in the database. RBAC is currently hardcoded in RBACContext.tsx.",
      variant: "default",
    });
  };

  // Get all unique permissions across all roles
  const getAllPermissions = (): Permission[] => {
    const allPermissions = new Set<Permission>();
    rolePermissions.forEach(role => {
      role.permissions.forEach(perm => allPermissions.add(perm));
    });
    return Array.from(allPermissions);
  };

  // For saving config changes (demonstration only)
  const handleSaveConfigChanges = () => {
    toast({
      title: "Developer Information",
      description: "To modify RBAC permissions in production, update the ROLE_PERMISSIONS mapping in src/contexts/RBACContext.tsx",
      variant: "default",
    });
    setConfigDialogOpen(false);
    setPermissionsChanged(false);
  };

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
            {isDeveloperAccount && (
              <Button onClick={() => setActiveTab("permissions")}>
                <Settings className="mr-2 h-4 w-4" />
                RBAC Configuration
              </Button>
            )}
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="mr-2 h-4 w-4" />
              RBAC Configuration
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
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Role-Based Access Control (RBAC) Configuration
                  </CardTitle>
                  <CardDescription>
                    Review and configure which permissions are assigned to each role in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rolePermissions.map((roleConfig) => (
                          <TableRow key={roleConfig.role}>
                            <TableCell className="font-medium">
                              <Badge variant={roleConfig.role === "admin" || roleConfig.role === "Super Admin" ? "default" : "outline"}>
                                {roleConfig.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{roleConfig.description}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {roleConfig.permissions.map(perm => (
                                  <Badge key={perm} variant="secondary" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                                {roleConfig.permissions.length === 0 && (
                                  <span className="text-muted-foreground text-xs">No permissions</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleConfigChange(roleConfig.role)}
                              >
                                Configure
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Alert className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Developer Information</AlertTitle>
                    <AlertDescription>
                      In this implementation, RBAC permissions are hardcoded in <code>src/contexts/RBACContext.tsx</code>.
                      This UI is for visualization purposes. In a production app, you would implement a backend API to manage these permissions.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <KeyRound className="mr-2 h-5 w-5" />
                    Available Permissions
                  </CardTitle>
                  <CardDescription>
                    All permissions defined in the system and their purpose
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Used By Roles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>view:dashboard</TableCell>
                        <TableCell>Access to view the admin dashboard</TableCell>
                        <TableCell>admin, security-admin, Super Admin</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>manage:users</TableCell>
                        <TableCell>Access to manage users</TableCell>
                        <TableCell>admin, security-admin, Super Admin</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>manage:issues</TableCell>
                        <TableCell>Access to manage issues</TableCell>
                        <TableCell>admin, security-admin, Super Admin, employee</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>manage:analytics</TableCell>
                        <TableCell>Access to view analytics</TableCell>
                        <TableCell>admin, security-admin, Super Admin</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>manage:settings</TableCell>
                        <TableCell>Access to change settings</TableCell>
                        <TableCell>admin, security-admin, Super Admin</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>access:security</TableCell>
                        <TableCell>Access to security features</TableCell>
                        <TableCell>admin, security-admin, Super Admin</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>create:dashboardUser</TableCell>
                        <TableCell>Permission to create dashboard users</TableCell>
                        <TableCell>admin, security-admin, Super Admin</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
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
                  <h3 className="font-semibold text-lg">RBAC System Files</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><code>src/contexts/RBACContext.tsx</code> - Core RBAC configuration, defines roles and permissions</li>
                    <li><code>src/hooks/useRoleAccess.tsx</code> - Hook for checking permissions with redirects</li>
                    <li><code>src/components/guards/RoleBasedGuard.tsx</code> - Route protection component</li>
                    <li><code>src/components/guards/PermissionGuards.tsx</code> - Pre-configured guards for common permissions</li>
                    <li><code>src/components/rbac/PermissionGate.tsx</code> - Component for conditional UI rendering</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">How to Modify Permissions</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Open <code>src/contexts/RBACContext.tsx</code></li>
                    <li>Modify the <code>ROLE_PERMISSIONS</code> mapping to update which permissions each role has</li>
                    <li>To add a new permission type, add it to the <code>Permission</code> type</li>
                    <li>Use the guards in <code>App.tsx</code> to protect routes</li>
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
                      <h3 className="text-sm font-medium text-yellow-800">Developer Note</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          For a production application, consider implementing a database-backed RBAC system where permissions are stored in the database rather than being hardcoded. This would allow for dynamic permission management through the UI.
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
        
        {/* Role configuration dialog */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Permissions for {selectedRoleConfig}</DialogTitle>
              <DialogDescription>
                Manage which permissions are assigned to this role
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {getAllPermissions().map(permission => {
                  const roleConfig = rolePermissions.find(r => r.role === selectedRoleConfig);
                  const hasPermission = roleConfig?.permissions.includes(permission) || false;
                  
                  return (
                    <div key={permission} className="flex items-center space-x-3 border p-3 rounded-md">
                      <Checkbox 
                        id={`permission-${permission}`}
                        checked={hasPermission}
                        onCheckedChange={() => {
                          if (selectedRoleConfig) {
                            togglePermissionForRole(selectedRoleConfig, permission);
                          }
                        }}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor={`permission-${permission}`}
                          className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {permission === 'view:dashboard' && 'Access to view the admin dashboard'}
                          {permission === 'manage:users' && 'Access to manage users'}
                          {permission === 'manage:issues' && 'Access to manage issues'}
                          {permission === 'manage:analytics' && 'Access to view analytics'}
                          {permission === 'manage:settings' && 'Access to change settings'}
                          {permission === 'access:security' && 'Access to security features'}
                          {permission === 'create:dashboardUser' && 'Permission to create dashboard users'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This is a demonstration UI. To actually modify permissions, you need to update the RBACContext.tsx file.
                    In a production app, these changes would be saved to a database.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveConfigChanges}
                disabled={!permissionsChanged}
              >
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AccessControl;
