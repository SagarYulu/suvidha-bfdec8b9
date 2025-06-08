
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface RBACContextType {
  userRoles: Role[];
  userPermissions: Permission[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (requiredPermissions: string[]) => boolean;
  loading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRBACData = async () => {
      if (!isAuthenticated || !user) {
        setUserRoles([]);
        setUserPermissions([]);
        return;
      }

      setLoading(true);
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          apiService.getUserRoles(user.id),
          apiService.getUserPermissions(user.id)
        ]);

        if (rolesResponse.success) {
          setUserRoles(rolesResponse.roles || []);
        }

        if (permissionsResponse.success) {
          setUserPermissions(permissionsResponse.permissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch RBAC data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRBACData();
  }, [isAuthenticated, user]);

  const hasPermission = (permission: string): boolean => {
    return userPermissions.some(p => p.name === permission);
  };

  const hasRole = (role: string): boolean => {
    return userRoles.some(r => r.name === role);
  };

  const canAccess = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  return (
    <RBACContext.Provider value={{
      userRoles,
      userPermissions,
      hasPermission,
      hasRole,
      canAccess,
      loading
    }}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};
