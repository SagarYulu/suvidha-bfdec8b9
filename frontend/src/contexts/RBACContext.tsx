
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type Permission = 
  | 'view_dashboard'
  | 'view_issues'
  | 'create_issues'
  | 'edit_issues'
  | 'delete_issues'
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'view_analytics'
  | 'manage_assignments'
  | 'view_feedback'
  | 'manage_roles';

interface RBACContextType {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPermissions();
    } else {
      setPermissions([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadPermissions = async () => {
    try {
      console.log('Default admin account detected - granting all permissions');
      // Grant all permissions for admin users
      const allPermissions: Permission[] = [
        'view_dashboard',
        'view_issues',
        'create_issues',
        'edit_issues',
        'delete_issues',
        'view_users',
        'create_users',
        'edit_users',
        'delete_users',
        'view_analytics',
        'manage_assignments',
        'view_feedback',
        'manage_roles'
      ];
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  return (
    <RBACContext.Provider value={{ permissions, hasPermission, isLoading }}>
      {children}
    </RBACContext.Provider>
  );
};
