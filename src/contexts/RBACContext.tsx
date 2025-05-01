
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { checkUserPermission, getPermissions } from '@/services/rbacService';
import { toast } from "@/hooks/use-toast";

// Define permission types
export type Permission = 
  | 'view:dashboard' 
  | 'manage:users' 
  | 'manage:issues'
  | 'manage:analytics'
  | 'manage:settings'
  | 'access:security'
  | 'create:dashboardUser';

// Define context type
type RBACContextType = {
  hasPermission: (permission: Permission) => boolean;
  userRole: string | null;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
};

// Create the context
const RBACContext = createContext<RBACContextType | undefined>(undefined);

// Provider props type
interface RBACProviderProps {
  children: ReactNode;
}

// RBAC Provider component
export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { authState } = useAuth();
  const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get current user role
  const userRole = authState.role || 'default';
  
  // Fetch permissions on auth state change
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id) {
      refreshPermissions();
    } else {
      setPermissionCache({});
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.user?.id]);
  
  // Function to refresh permissions from the database
  const refreshPermissions = async () => {
    if (!authState.isAuthenticated || !authState.user?.id) {
      setPermissionCache({});
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get all defined permissions
      const allPermissions = await getPermissions();
      
      // Build a cache of all permissions for the current user
      const cache: Record<string, boolean> = {};
      
      for (const perm of allPermissions) {
        // Check if the user has this permission
        const hasPermission = await checkUserPermission(authState.user.id, perm.name);
        cache[perm.name] = hasPermission;
      }
      
      setPermissionCache(cache);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => ({
    // Function to check if user has a specific permission
    hasPermission: (permission: Permission): boolean => {
      // If not authenticated, no permissions
      if (!authState.isAuthenticated) {
        return false;
      }
      
      // Special case for sagar.km@yulu.bike - grant all permissions
      if (authState.user?.email === 'sagar.km@yulu.bike') {
        console.log('Special access granted for developer account');
        return true;
      }
      
      // Check the permission cache
      return permissionCache[permission] || false;
    },
    userRole,
    isLoading,
    refreshPermissions
  }), [authState.isAuthenticated, userRole, authState.user, permissionCache, isLoading]);
  
  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
};

// Custom hook to use RBAC context
export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  
  return context;
};
