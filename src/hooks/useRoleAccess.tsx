
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
  const { hasPermission, userRole } = useRBAC();
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

    // Then check permission
    const hasAccess = hasPermission(permission);
    
    if (!hasAccess) {
      console.log(`Permission denied: ${permission} for role ${userRole}`);
      if (showToast) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this resource',
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
    userRole
  };
};
