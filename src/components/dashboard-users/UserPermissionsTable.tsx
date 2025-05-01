
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

interface UserPermissionsTableProps {
  dashboardUsers: DashboardUser[];
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (userId: string, permissionId: string) => boolean;
  togglePermission: (userId: string, permissionId: string) => Promise<void>;
}

const UserPermissionsTable: React.FC<UserPermissionsTableProps> = ({
  dashboardUsers,
  permissions,
  isLoading,
  hasPermission,
  togglePermission,
}) => {
  const [pendingPermissions, setPendingPermissions] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleTogglePermission = async (userId: string, permissionId: string) => {
    // Clear any previous error
    setErrorMessage(null);
    
    const permissionKey = `${userId}-${permissionId}`;
    setPendingPermissions(prev => {
      const newSet = new Set(prev);
      newSet.add(permissionKey);
      return newSet;
    });
    
    try {
      await togglePermission(userId, permissionId);
    } catch (error) {
      console.error("Error toggling permission:", error);
      if (error instanceof Error) {
        // More specific error message for RLS violations
        if (error.message.includes("row-level security policy")) {
          setErrorMessage("Permission change failed due to security policy restrictions. This may require administrator privileges.");
        } else {
          setErrorMessage(`Failed to update permission: ${error.message}`);
        }
      } else {
        setErrorMessage("An unexpected error occurred while updating permissions");
      }
      
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    } finally {
      setPendingPermissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(permissionKey);
        return newSet;
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (dashboardUsers.length === 0) {
    return <div className="text-center py-10">No dashboard users found</div>;
  }

  return (
    <div>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
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
            {dashboardUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "Super Admin" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                {permissions.map(permission => {
                  const permissionKey = `${user.id}-${permission.id}`;
                  const isPending = pendingPermissions.has(permissionKey);
                  const isChecked = hasPermission(user.id, permission.id);
                  
                  // Super Admin users automatically have all permissions
                  const isSuperAdmin = user.role === "Super Admin";
                  
                  return (
                    <TableCell key={permissionKey} className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox 
                                checked={isSuperAdmin || isChecked}
                                disabled={isPending || isSuperAdmin}
                                onCheckedChange={() => handleTogglePermission(user.id, permission.id)}
                                className={isPending ? "opacity-50 animate-pulse" : isSuperAdmin ? "opacity-80" : ""}
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
                                    ? `Remove "${permission.name}" permission from ${user.name}` 
                                    : `Grant "${permission.name}" permission to ${user.name}`
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
    </div>
  );
};

export default UserPermissionsTable;
