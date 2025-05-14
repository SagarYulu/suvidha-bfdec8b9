import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Permission } from '@/contexts/RBACContext';

interface AccessCheckOptions {
  redirectTo?: string | false;
  showToast?: boolean;
}

/**
 * Custom hook for checking user permissions based on roles
 */
export const useRoleAccess = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  // Check if the user has a specific permission
  const checkAccess = useCallback((permission: Permission, options: AccessCheckOptions = {}) => {
    const { redirectTo = '/admin/login', showToast = true } = options;
    
    // Special case for Super Admin or specific admin users
    if (
      authState.role === "Super Admin" || 
      authState.role === "admin" ||
      authState.user?.email === "sagar.km@yulu.bike" || 
      authState.user?.email === "admin@yulu.com"
    ) {
      console.log(`useRoleAccess: Developer/admin account - granting access to: ${permission}`);
      return true;
    }

    // Check if user is authenticated - this is critical
    if (!authState.isAuthenticated) {
      console.log(`useRoleAccess: User not authenticated, needs permission: ${permission}`);
      
      // Only redirect if redirectTo is a string AND we're explicitly asked to redirect
      if (redirectTo !== false && typeof redirectTo === 'string') {
        if (showToast) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page.",
            variant: "destructive"
          });
        }
        
        console.log(`useRoleAccess: Redirecting unauthenticated user to ${redirectTo}`);
        navigate(redirectTo, { replace: true });
      } else {
        console.log('useRoleAccess: Not redirecting - redirect disabled');
      }
      
      return false;
    }

    // At this point we know the user is authenticated
    
    // Logic for checking role-specific permissions
    const permissions = authState.role ? getPermissionsForRole(authState.role) : [];
    if (permissions.includes(permission)) {
      console.log(`useRoleAccess: User has permission: ${permission}`);
      return true;
    }
    
    console.log(`useRoleAccess: User does not have permission: ${permission}`);
    
    // Access denied - user is authenticated but doesn't have the required permission
    if (showToast) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access this resource.`,
        variant: "destructive"
      });
    }
    
    // Only redirect if redirectTo is a string AND we're explicitly asked to redirect
    if (redirectTo !== false && typeof redirectTo === 'string') {
      console.log(`useRoleAccess: Redirecting due to insufficient permissions to ${redirectTo}`);
      navigate(redirectTo, { replace: true });
    } else {
      console.log('useRoleAccess: Not redirecting - redirect disabled');
    }
    
    return false;
  }, [authState, navigate]);

  return {
    checkAccess,
    isAuthenticated: authState.isAuthenticated,
    role: authState.role
  };
};

// Mock function to get permissions based on role
const getPermissionsForRole = (role: string): Permission[] => {
  switch (role) {
    case 'Super Admin':
      return [
        'view:dashboard',
        'manage:users',
        'manage:issues',
        'manage:analytics',
        'manage:settings',
        'access:security',
        'create:dashboardUser'
      ];
    case 'admin':
      return [
        'view:dashboard',
        'manage:users',
        'manage:issues',
        'manage:analytics',
        'manage:settings',
        'access:security',
        'create:dashboardUser'
      ];
    case 'City Head':
      return ['view:dashboard', 'manage:issues'];
    case 'Revenue and Ops Head':
      return ['view:dashboard', 'manage:analytics'];
    case 'CRM':
      return ['view:dashboard', 'manage:users'];
    case 'Cluster Head':
      return ['view:dashboard', 'manage:issues'];
    case 'Payroll Ops':
      return ['view:dashboard', 'manage:settings'];
    case 'HR Admin':
      return ['view:dashboard', 'manage:users'];
    case 'security-admin':
      return ['view:dashboard', 'access:security'];
    default:
      return [];
  }
};
