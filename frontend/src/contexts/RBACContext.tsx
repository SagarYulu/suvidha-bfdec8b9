
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface Permission {
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface RBACContextType {
  userRole: string | null;
  userPermissions: Permission[];
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRoleAndPermissions();
  }, []);

  const loadUserRoleAndPermissions = async () => {
    try {
      const user = authService.getStoredUser();
      if (user) {
        setUserRole(user.role);
        // In a real app, you'd fetch permissions from the API
        // For now, we'll use some default permissions based on role
        setUserPermissions(getDefaultPermissions(user.role));
      }
    } catch (error) {
      console.error('Failed to load user role and permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPermissions = (role: string): Permission[] => {
    switch (role) {
      case 'admin':
        return [
          { resource: '*', action: '*' }, // Admin has all permissions
        ];
      case 'agent':
        return [
          { resource: 'issues', action: 'read' },
          { resource: 'issues', action: 'update' },
          { resource: 'comments', action: 'create' },
          { resource: 'comments', action: 'read' },
          { resource: 'analytics', action: 'read' },
        ];
      case 'user':
        return [
          { resource: 'issues', action: 'create' },
          { resource: 'issues', action: 'read_own' },
          { resource: 'comments', action: 'create' },
          { resource: 'comments', action: 'read_own' },
        ];
      default:
        return [];
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!userPermissions) return false;
    
    return userPermissions.some(permission => 
      (permission.resource === '*' && permission.action === '*') ||
      (permission.resource === resource && permission.action === '*') ||
      (permission.resource === resource && permission.action === action)
    );
  };

  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  const value: RBACContextType = {
    userRole,
    userPermissions,
    hasPermission,
    hasRole,
    isLoading
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};
