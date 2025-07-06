
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface Permission {
  resource: string;
  action: string;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  userPermissions: Permission[];
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  userPermissions,
  fallback
}) => {
  const hasPermission = (required: Permission) => {
    return userPermissions.some(
      permission => 
        permission.resource === required.resource && 
        permission.action === required.action
    );
  };

  const hasAllPermissions = requiredPermissions.every(hasPermission);

  if (!hasAllPermissions) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this resource.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
