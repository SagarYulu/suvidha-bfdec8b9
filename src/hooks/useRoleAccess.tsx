
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useRBAC, Permission } from '@/contexts/RBACContext';

interface UseRoleAccessOptions {
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * Hook to check if the current user has the required permission
 */
export const useRoleAccess = () => {
  const { authState } = useAuth();
  const { hasPermission, userRole, isLoading } = useRBAC();
  const navigate = useNavigate();

  /**
   * Check if user has required permission
   * @param permission The permission to check
   * @param options Options for redirection and toasts
   * @returns boolean indicating if user has access
   */
  const checkAccess = (
    permission: Permission,
    { redirectTo = '/', showToast = true }: UseRoleAccessOptions = {}
  ): boolean => {
    // If still loading permissions, allow access (will be checked again once loaded)
    if (isLoading) {
      return true;
    }
    
    // Special case for developer account
    if (authState.user?.email === 'sagar.km@yulu.bike') {
      console.log('Developer account - granting full access');
      return true;
    }
    
    // First check authentication
    if (!authState.isAuthenticated) {
      console.log('Not authenticated, access denied');
      if (showToast) {
        toast({
          title: 'Access Denied',
          description: 'Please log in to continue',
          variant: 'destructive',
        });
      }
      navigate(redirectTo);
      return false;
    }

    // Special handling for employee users (non-dashboard users)
    // If a user doesn't have an explicit dashboard role, and they're trying to access
    // a permission that doesn't require special access, grant access
    const isEmployeeUser = authState.user && 
      !['admin', 'Super Admin', 'security-admin', 'City Head', 'Revenue and Ops Head', 
        'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin'].includes(authState.role || '');
    
    const isBasicEmployeePermission = ['view:dashboard', 'manage:issues'].includes(permission);
    
    if (isEmployeeUser && isBasicEmployeePermission) {
      console.log('Employee user granted basic permission:', permission);
      return true;
    }

    // Handle special case for security-user-1 demo account
    // This is a non-UUID user that needs special handling
    if (authState.user?.id === 'security-user-1' && authState.role === 'security-admin') {
      console.log('Security admin demo account - granting access');
      return true;
    }

    // Then check permission
    const hasAccess = hasPermission(permission);
    
    if (!hasAccess) {
      console.log(`Permission denied: ${permission} for role ${userRole}`);
      if (showToast) {
        toast({
          title: 'Access Denied',
          description: `You do not have the "${permission}" permission required for this page`,
          variant: 'destructive',
        });
      }
      navigate(redirectTo);
    }
    
    return hasAccess;
  };

  return {
    checkAccess,
    isAuthenticated: authState.isAuthenticated,
    userRole,
    isLoading
  };
};
