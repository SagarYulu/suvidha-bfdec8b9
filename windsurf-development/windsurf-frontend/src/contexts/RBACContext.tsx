
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface RBACContextType {
  userRoles: Role[];
  permissions: Permission[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

interface RBACProviderProps {
  children: ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Mock RBAC data - replace with actual API calls
      const mockRoles: Role[] = [
        {
          id: '1',
          name: user.role,
          permissions: [
            { id: '1', name: 'view:dashboard' },
            { id: '2', name: 'manage:issues' },
            { id: '3', name: 'view:analytics' },
          ]
        }
      ];
      
      setUserRoles(mockRoles);
      setPermissions(mockRoles.flatMap(role => role.permissions));
    } else {
      setUserRoles([]);
      setPermissions([]);
    }
    setIsLoading(false);
  }, [user]);

  const hasPermission = (permissionName: string): boolean => {
    return permissions.some(permission => permission.name === permissionName);
  };

  const hasRole = (roleName: string): boolean => {
    return userRoles.some(role => role.name === roleName);
  };

  return (
    <RBACContext.Provider value={{
      userRoles,
      permissions,
      hasPermission,
      hasRole,
      isLoading,
    }}>
      {children}
    </RBACContext.Provider>
  );
};
