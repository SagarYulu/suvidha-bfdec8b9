
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Loader2 } from 'lucide-react';
import { Permission } from '@/contexts/RBACContext';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  permission: Permission;
  redirectTo?: string;
  showLoadingScreen?: boolean;
}

/**
 * Component that protects routes based on user permissions
 */
const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  permission,
  redirectTo = '/admin/login',
  showLoadingScreen = true
}) => {
  const { authState } = useAuth();
  const { hasPermission } = useRoleAccess();
  
  console.log('RoleBasedGuard: Checking permission:', permission);
  
  // Check if user is authenticated
  const isAuthenticated = authState.isAuthenticated;
  
  // Check if user has permission
  const accessResult = hasPermission(permission);
  
  console.log('RoleBasedGuard: Access result for', permission + ':', accessResult);
  
  // If auth state is loading, show a loading screen
  if (authState.loading && showLoadingScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('RoleBasedGuard: User not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // If user doesn't have permission, redirect to specified path
  if (!accessResult) {
    console.log('RoleBasedGuard: Access denied for', permission, 'redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // User has permission, render children
  console.log('RoleBasedGuard: Access granted for', permission, 'rendering children');
  return <>{children}</>;
};

export default RoleBasedGuard;
