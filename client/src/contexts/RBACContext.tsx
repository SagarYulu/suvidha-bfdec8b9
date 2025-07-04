import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define permission types
export type Permission = 
  | 'view:dashboard' 
  | 'manage:users' 
  | 'manage:issues'
  | 'manage:analytics'
  | 'manage:settings'
  | 'access:security'
  | 'create:dashboardUser'
  | 'view_analytics';

// Define context type
type RBACContextType = {
  hasPermission: (permission: Permission) => boolean;
  userRole: string | null;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
};

// Create the context
const RBACContext = createContext<RBACContextType | undefined>(undefined);

// Provider props type
interface RBACProviderProps {
  children: ReactNode;
}

// RBAC Provider component
export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { authState } = useAuth();
  const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get current user role
  const userRole = authState.role || null;
  
  // Simple role-based permissions mapping
  const getPermissionsForRole = (role: string): Record<Permission, boolean> => {
    const basePermissions: Record<Permission, boolean> = {
      'view:dashboard': false,
      'manage:users': false,
      'manage:issues': false,
      'manage:analytics': false,
      'manage:settings': false,
      'access:security': false,
      'create:dashboardUser': false,
      'view_analytics': false
    };

    // Admin roles get all permissions
    if (role === 'Super Admin' || role === 'admin') {
      return Object.keys(basePermissions).reduce((acc, key) => {
        acc[key as Permission] = true;
        return acc;
      }, {} as Record<Permission, boolean>);
    }

    // Dashboard user roles
    switch (role) {
      case 'City Head':
      case 'Revenue and Ops Head':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'manage:users': true,
          'manage:issues': true,
          'manage:analytics': true,
          'view_analytics': true
        };
      
      case 'HR Admin':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'manage:users': true,
          'manage:issues': true,
          'create:dashboardUser': true
        };
      
      case 'Cluster Head':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'manage:issues': true,
          'view_analytics': true
        };
      
      case 'CRM':
      case 'Payroll Ops':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'manage:issues': true
        };
      
      case 'security-admin':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'access:security': true,
          'manage:users': true
        };
      
      default:
        // Employee roles or unknown roles get no permissions
        return basePermissions;
    }
  };

  // Update permissions when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated && userRole) {
      const permissions = getPermissionsForRole(userRole);
      setPermissionCache(permissions);
    } else {
      setPermissionCache({});
    }
    setIsLoading(false);
  }, [authState.isAuthenticated, userRole]);

  // Function to refresh permissions
  const refreshPermissions = async () => {
    if (userRole) {
      const permissions = getPermissionsForRole(userRole);
      setPermissionCache(permissions);
    }
  };

  // Function to check if user has permission
  const hasPermission = (permission: Permission): boolean => {
    return permissionCache[permission] || false;
  };

  const contextValue = useMemo(() => ({
    hasPermission,
    userRole,
    isLoading,
    refreshPermissions
  }), [permissionCache, userRole, isLoading]);

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
};

// Hook to use RBAC context
export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};