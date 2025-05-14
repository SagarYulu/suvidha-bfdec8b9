
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Permission } from '@/contexts/RBACContext';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  permission: Permission;
  redirectTo?: string;
}

/**
 * A component that guards routes based on user permissions
 */
const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  permission,
  redirectTo = '/'
}) => {
  const { hasPermission, isAuthenticated } = useRoleAccess();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Only check access once authentication state is known and stable
    if (isAuthenticated !== undefined) {
      console.log(`RoleBasedGuard: Checking permission: ${permission}`);
      
      // Directly use the hasPermission function from useRoleAccess
      const access = hasPermission(permission);
      
      console.log(`RoleBasedGuard: Access result for ${permission}: ${access}`);
      setHasAccess(access);
      setAccessChecked(true);
    }
  }, [isAuthenticated, permission, hasPermission]);

  // Show loading indicator while checking access
  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  // If no access, redirect
  if (!hasAccess) {
    console.log(`RoleBasedGuard: Access denied for ${permission}, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  // If has access, render children
  console.log(`RoleBasedGuard: Access granted for ${permission}, rendering children`);
  return <>{children}</>;
};

export default RoleBasedGuard;
