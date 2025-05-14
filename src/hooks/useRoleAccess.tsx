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
      console.log("Developer account - granting access to:", permission);
      return true;
    }

    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      console.log(`User not authenticated, needs permission: ${permission}`);
      
      // Only redirect if redirectTo is a string
      if (redirectTo !== false && typeof redirectTo === 'string') {
        if (showToast) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page.",
            variant: "destructive"
          });
        }
        navigate(redirectTo, { replace: true });
      }
      return false;
    }

    // Logic for checking role-specific permissions
    const permissions = authState.role ? getPermissionsForRole(authState.role) : [];
    if (permissions.includes(permission)) {
      console.log(`User has permission: ${permission}`);
      return true;
    }
    
    console.log(`User does not have permission: ${permission}`);
    
    // Access denied
    if (showToast) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access this resource.`,
        variant: "destructive"
      });
    }
    
    // Only redirect if redirectTo is a string
    if (redirectTo !== false && typeof redirectTo === 'string') {
      navigate(redirectTo, { replace: true });
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
