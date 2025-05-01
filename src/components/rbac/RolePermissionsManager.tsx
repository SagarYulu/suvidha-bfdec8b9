
import React, { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Role,
  Permission,
  getRoles, 
  getPermissions,
  getPermissionsForRole,
  assignPermissionToRole,
  removePermissionFromRole
} from '@/services/rbacService';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/contexts/RBACContext';

const RolePermissionsManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { authState } = useAuth();
  const { refreshPermissions } = useRBAC();
  
  // Check if current user is an admin
  const isAdmin = authState.role === 'admin' || authState.role === 'security-admin' || 
                  authState.user?.email === 'sagar.km@yulu.bike';

  // Load roles and permissions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch all roles and permissions
      const [allRoles, allPermissions] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);
      
      setRoles(allRoles);
      setPermissions(allPermissions);
      
      // Initialize role permissions structure
      const permissionMap: Record<string, Record<string, boolean>> = {};
      
      // Fetch permissions for each role
      for (const role of allRoles) {
        const rolePermList = await getPermissionsForRole(role.id);
        
        permissionMap[role.id] = {};
        
        // Initialize all permissions to false
        for (const perm of allPermissions) {
          permissionMap[role.id][perm.id] = false;
        }
        
        // Set true for permissions that the role has
        for (const perm of rolePermList) {
          permissionMap[role.id][perm.id] = true;
        }
      }
      
      setRolePermissions(permissionMap);
    } catch (error) {
      console.error('Error loading RBAC data:', error);
      setErrorMessage('Failed to load roles and permissions data');
      toast({
        title: "Error",
        description: "Failed to load roles and permissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle permission for a role
  const handleTogglePermission = async (roleId: string, roleName: string, permId: string, permName: string) => {
    // Clear any previous error
    setErrorMessage(null);
    
    const permissionKey = `${roleId}-${permId}`;
    
    // Prevent duplicate toggles
    if (pendingChanges.has(permissionKey)) {
      return;
    }
    
    // Get the current state
    const hasPermission = rolePermissions[roleId][permId];
    
    // Optimistically update UI
    setRolePermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permId]: !hasPermission
      }
    }));
    
    // Mark as pending
    setPendingChanges(prev => {
      const newSet = new Set(prev);
      newSet.add(permissionKey);
      return newSet;
    });
    
    try {
      let success;
      
      if (hasPermission) {
        // Remove permission from role
        success = await removePermissionFromRole(roleName, permName);
      } else {
        // Add permission to role
        success = await assignPermissionToRole(roleName, permName);
      }
      
      if (!success) {
        throw new Error('Operation failed');
      }
      
      // On success, refresh permissions to update the UI
      await refreshPermissions();
      
      toast({
        title: "Success",
        description: hasPermission 
          ? `Removed "${permName}" permission from ${roleName}` 
          : `Added "${permName}" permission to ${roleName}`,
      });
    } catch (error) {
      console.error('Error toggling permission:', error);
      
      // Revert optimistic update
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [permId]: hasPermission
        }
      }));
      
      // Show error message
      setErrorMessage(`Failed to update permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    } finally {
      // Remove from pending changes
      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(permissionKey);
        return newSet;
      });
    }
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need administrator privileges to manage role permissions.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-medium">Role Permissions Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage which permissions are assigned to each role
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              {permissions.map(permission => (
                <TableHead key={permission.id} className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center">
                        <span className="mr-1">{permission.name}</span>
                        {permission.description && (
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TooltipTrigger>
                      {permission.description && (
                        <TooltipContent>
                          <p>{permission.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <Badge variant={role.name === "Super Admin" ? "secondary" : "outline"} className="font-medium">
                    {role.name}
                  </Badge>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                  )}
                </TableCell>
                {permissions.map(permission => {
                  const isChecked = rolePermissions[role.id]?.[permission.id] || false;
                  const isPending = pendingChanges.has(`${role.id}-${permission.id}`);
                  const isSuperAdmin = role.name === "Super Admin"; // Super Admin always has all permissions
                  
                  return (
                    <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center justify-center">
                              <Checkbox
                                checked={isSuperAdmin || isChecked}
                                disabled={isPending || isSuperAdmin}
                                className={`cursor-pointer ${
                                  isPending ? "opacity-50 animate-pulse" : 
                                  isSuperAdmin ? "opacity-80" : ""
                                }`}
                                onCheckedChange={() => {
                                  if (!isPending && !isSuperAdmin) {
                                    handleTogglePermission(role.id, role.name, permission.id, permission.name);
                                  }
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {isSuperAdmin 
                                ? "Super Admins have all permissions by default"
                                : isPending 
                                  ? "Processing..." 
                                  : isChecked 
                                    ? `Remove "${permission.name}" permission from ${role.name}` 
                                    : `Grant "${permission.name}" permission to ${role.name}`
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          Permissions assigned to roles will affect all users who have those roles.
          Changes take effect immediately.
        </p>
      </div>
    </Card>
  );
};

export default RolePermissionsManager;
