
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface RBACContextType {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  userRole: string | null;
  permissions: string[];
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

interface RBACProviderProps {
  children: ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { authState } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!authState.permissions) return false;
    return authState.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return authState.role === role;
  };

  return (
    <RBACContext.Provider value={{
      hasPermission,
      hasRole,
      userRole: authState.role,
      permissions: authState.permissions
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
