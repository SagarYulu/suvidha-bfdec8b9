
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';

// Define permission types
export type Permission = 
  | 'view:dashboard' 
  | 'manage:users' 
  | 'manage:issues'
  | 'manage:analytics'
  | 'manage:settings'
  | 'access:security'
  | 'create:dashboardUser';

// Define role-based permissions map
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Admin has all permissions
  'admin': [
    'view:dashboard',
    'manage:users',
    'manage:issues',
    'manage:analytics',
    'manage:settings',
    'access:security',
    'create:dashboardUser'
  ],
  // Security admin has full admin permissions for your specific email
  'security-admin': [
    'view:dashboard',
    'manage:users',
    'manage:issues',
    'manage:analytics', 
    'manage:settings',
    'access:security',
    'create:dashboardUser'
  ],
  // Super Admin (from dashboard_users) has all permissions
  'Super Admin': [
    'view:dashboard',
    'manage:users',
    'manage:issues',
    'manage:analytics',
    'manage:settings',
    'access:security',
    'create:dashboardUser'
  ],
  // Employee role has limited permissions
  'employee': [
    'manage:issues'
  ],
  // Default role with very limited access
  'default': []
};

// Define context type
type RBACContextType = {
  hasPermission: (permission: Permission) => boolean;
  userRole: string | null;
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
  
  // Get current user role
  const userRole = authState.role || 'default';
  
  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => ({
    // Function to check if user has a specific permission
    hasPermission: (permission: Permission): boolean => {
      // If not authenticated, no permissions
      if (!authState.isAuthenticated) {
        return false;
      }
      
      // Special case for sagar.km@yulu.bike - grant all permissions
      if (authState.user?.email === 'sagar.km@yulu.bike') {
        console.log('Special access granted for developer account');
        return true;
      }
      
      // Get permissions for the user's role
      const rolePermissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['default'];
      
      // Check if the requested permission is in the role's permissions
      return rolePermissions.includes(permission);
    },
    userRole
  }), [authState.isAuthenticated, userRole, authState.user]);
  
  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
};

// Custom hook to use RBAC context
export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  
  return context;
};
