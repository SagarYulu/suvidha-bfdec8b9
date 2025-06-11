
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  userRole: string;
  fallback?: React.ReactNode;
}

const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  allowedRoles,
  userRole,
  fallback
}) => {
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have the required role to access this content.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default RoleBasedGuard;
