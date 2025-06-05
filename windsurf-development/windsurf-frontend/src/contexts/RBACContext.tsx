
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_issues'
  | 'view_analytics'
  | 'manage_settings'
  | 'access_security'
  | 'create_dashboardUser';

interface RBACContextType {
  hasPermission: (permission: Permission) => boolean;
  role: string | null;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

interface RBACProviderProps {
  children: ReactNode;
}

const getPermissionsForRole = (role: string): Permission[] => {
  switch (role) {
    case 'admin':
    case 'Super Admin':
      return [
        'view_dashboard',
        'manage_users',
        'manage_issues',
        'view_analytics',
        'manage_settings',
        'access_security',
        'create_dashboardUser'
      ];
    case 'manager':
      return ['view_dashboard', 'manage_issues', 'view_analytics'];
    case 'support':
      return ['view_dashboard', 'manage_issues'];
    default:
      return [];
  }
};

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { authState } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!authState.isAuthenticated || !authState.role) {
      return false;
    }

    const permissions = getPermissionsForRole(authState.role);
    return permissions.includes(permission);
  };

  return (
    <RBACContext.Provider value={{ hasPermission, role: authState.role }}>
      {children}
    </RBACContext.Provider>
  );
};
