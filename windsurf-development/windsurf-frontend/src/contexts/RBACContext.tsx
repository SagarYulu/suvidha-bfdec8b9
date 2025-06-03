
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Permission = 
  | 'view:dashboard'
  | 'view:issues'
  | 'manage:issues'
  | 'view:analytics'
  | 'manage:users'
  | 'create:dashboardUser'
  | 'view:feedback'
  | 'view:settings';

interface RBACContextType {
  hasPermission: (permission: Permission) => boolean;
  canAccessRoute: (route: string) => boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

// Role-based permissions mapping
const rolePermissions: Record<string, Permission[]> = {
  'Super Admin': [
    'view:dashboard',
    'view:issues',
    'manage:issues',
    'view:analytics',
    'manage:users',
    'create:dashboardUser',
    'view:feedback',
    'view:settings',
  ],
  'admin': [
    'view:dashboard',
    'view:issues',
    'manage:issues',
    'view:analytics',
    'manage:users',
    'create:dashboardUser',
    'view:feedback',
    'view:settings',
  ],
  'security-admin': [
    'view:dashboard',
    'view:issues',
    'manage:issues',
    'view:analytics',
    'manage:users',
    'create:dashboardUser',
    'view:feedback',
    'view:settings',
  ],
  'HR Admin': [
    'view:dashboard',
    'view:issues',
    'manage:issues',
    'view:analytics',
    'create:dashboardUser',
    'view:feedback',
  ],
  'City Head': [
    'view:dashboard',
    'view:issues',
    'view:analytics',
    'view:feedback',
  ],
  'Revenue and Ops Head': [
    'view:dashboard',
    'view:issues',
    'view:analytics',
    'view:feedback',
  ],
  'CRM': [
    'view:dashboard',
    'view:issues',
    'manage:issues',
    'view:feedback',
  ],
  'Cluster Head': [
    'view:dashboard',
    'view:issues',
    'view:analytics',
    'view:feedback',
  ],
  'Payroll Ops': [
    'view:dashboard',
    'view:issues',
    'view:feedback',
  ],
};

interface RBACProviderProps {
  children: ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { authState } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!authState.isAuthenticated || !authState.role) {
      return false;
    }

    const userPermissions = rolePermissions[authState.role] || [];
    return userPermissions.includes(permission);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!authState.isAuthenticated) {
      return route === '/admin/login' || route === '/mobile/login' || route === '/';
    }

    // Route-based access control
    if (route.startsWith('/admin/')) {
      return hasPermission('view:dashboard');
    }

    if (route.startsWith('/mobile/')) {
      return authState.role === 'employee';
    }

    return true;
  };

  const value: RBACContextType = {
    hasPermission,
    canAccessRoute,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};
