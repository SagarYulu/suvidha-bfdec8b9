
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define the Permission type
export type Permission = 
  | 'view:dashboard'
  | 'manage:issues' 
  | 'manage:users' 
  | 'manage:analytics'
  | 'create:dashboardUser'
  | 'access:security'
  | 'manage:settings'
  | 'manage:testdata';

interface PermissionContextType {
  hasPermission: (permission: Permission) => boolean;
  permissions: Permission[];
}

const defaultPermissionContext: PermissionContextType = {
  hasPermission: () => false,
  permissions: [],
};

const PermissionContext = createContext<PermissionContextType>(defaultPermissionContext);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user, role } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    // Default admin account always has these permissions for testing
    if (user?.email === 'admin@example.com') {
      const adminPermissions: Permission[] = [
        'view:dashboard',
        'manage:issues',
        'manage:users',
        'manage:analytics',
        'create:dashboardUser',
        'access:security', 
        'manage:settings',
        'manage:testdata'
      ];
      
      adminPermissions.forEach(permission => {
        console.info('Default admin account - granting access to:', permission);
      });
      
      setPermissions(adminPermissions);
      return;
    }

    // Load permissions based on role or from API
    if (user && role) {
      // In a real app, you might fetch permissions from an API
      const rolePermissions: Permission[] = [];
      
      // Simple role-based permissions for demo purposes
      if (role === 'admin') {
        rolePermissions.push(
          'view:dashboard',
          'manage:issues',
          'manage:users',
          'manage:analytics',
          'create:dashboardUser',
          'access:security',
          'manage:settings',
          'manage:testdata'
        );
      } else if (role === 'manager') {
        rolePermissions.push(
          'view:dashboard',
          'manage:issues',
          'manage:analytics'
        );
      } else if (role === 'agent') {
        rolePermissions.push(
          'view:dashboard',
          'manage:issues'
        );
      }
      
      setPermissions(rolePermissions);
    } else {
      setPermissions([]);
    }
  }, [user, role]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider value={{ hasPermission, permissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => useContext(PermissionContext);
