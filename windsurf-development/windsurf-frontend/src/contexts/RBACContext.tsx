
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
}

interface RBACContextType {
  permissions: Permission[];
  roles: Role[];
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

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (isAuthenticated && user) {
        try {
          const [permissionsResponse, rolesResponse] = await Promise.all([
            apiService.getUserPermissions(user.id),
            apiService.getUserRoles(user.id)
          ]);
          
          if (permissionsResponse.permissions) {
            setPermissions(permissionsResponse.permissions);
          }
          
          if (rolesResponse.roles) {
            setRoles(rolesResponse.roles);
          }
        } catch (error) {
          console.error('Failed to fetch RBAC data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (permission: string) => {
    return permissions.some(p => p.name === permission);
  };

  const hasRole = (role: string) => {
    return roles.some(r => r.name === role);
  };

  const value = {
    permissions,
    roles,
    hasPermission,
    hasRole,
    isLoading,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export { RBACContext };
