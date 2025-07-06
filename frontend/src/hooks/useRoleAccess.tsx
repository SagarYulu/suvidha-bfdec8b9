
import { useMemo } from 'react';
import { useRBAC } from '@/contexts/RBACContext';

interface RoleAccessConfig {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles, otherwise ANY
}

export const useRoleAccess = (config: RoleAccessConfig) => {
  const { hasPermission, hasRole, userRole, permissions } = useRBAC();

  const hasAccess = useMemo(() => {
    const { requiredPermissions = [], requiredRoles = [], requireAll = false } = config;

    // Check permissions
    if (requiredPermissions.length > 0) {
      const permissionCheck = requireAll
        ? requiredPermissions.every(permission => hasPermission(permission))
        : requiredPermissions.some(permission => hasPermission(permission));
      
      if (!permissionCheck) return false;
    }

    // Check roles
    if (requiredRoles.length > 0) {
      const roleCheck = requireAll
        ? requiredRoles.every(role => hasRole(role))
        : requiredRoles.some(role => hasRole(role));
      
      if (!roleCheck) return false;
    }

    return true;
  }, [hasPermission, hasRole, config]);

  const getAccessDetails = () => ({
    hasAccess,
    userRole,
    userPermissions: permissions,
    missingPermissions: config.requiredPermissions?.filter(p => !hasPermission(p)) || [],
    missingRoles: config.requiredRoles?.filter(r => !hasRole(r)) || []
  });

  return {
    hasAccess,
    getAccessDetails,
    // Convenience methods
    canView: hasAccess,
    canEdit: hasAccess && hasPermission('edit'),
    canDelete: hasAccess && hasPermission('delete'),
    canCreate: hasAccess && hasPermission('create')
  };
};

// Hook for common permission patterns
export const usePermissionPatterns = () => {
  const { hasPermission } = useRBAC();

  return {
    // User management patterns
    canManageUsers: hasPermission('user_management'),
    canViewUsers: hasPermission('user_view') || hasPermission('user_management'),
    canEditUsers: hasPermission('user_edit') || hasPermission('user_management'),
    canDeleteUsers: hasPermission('user_delete') || hasPermission('user_management'),

    // Analytics patterns
    canViewAnalytics: hasPermission('analytics_view') || hasPermission('analytics'),
    canExportData: hasPermission('analytics_export') || hasPermission('export'),
    canViewSentiment: hasPermission('sentiment_view') || hasPermission('analytics'),

    // Issue management patterns
    canManageIssues: hasPermission('issue_management'),
    canViewAllIssues: hasPermission('issue_view_all') || hasPermission('issue_management'),
    canAssignIssues: hasPermission('issue_assign') || hasPermission('issue_management'),
    canEscalateIssues: hasPermission('issue_escalate') || hasPermission('issue_management'),

    // Admin patterns
    isAdmin: hasPermission('admin') || hasPermission('system_admin'),
    canManageRoles: hasPermission('role_management') || hasPermission('admin'),
    canAccessSettings: hasPermission('settings') || hasPermission('admin')
  };
};

export default useRoleAccess;
