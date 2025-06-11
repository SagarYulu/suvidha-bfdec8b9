
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface RBACContextType {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (requiredRoles: string[]) => boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    // Implementation based on user permissions from backend
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Add specific permission logic based on your backend
    return false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const canAccess = (requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const value: RBACContextType = {
    hasPermission,
    hasRole,
    canAccess,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};
