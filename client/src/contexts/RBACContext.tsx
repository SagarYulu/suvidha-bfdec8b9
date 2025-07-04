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
  | 'create:dashboardUser'
  | 'view_analytics'; // Added view_analytics permission

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

// Extended User type to include possible runtime fields
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  user_id?: string; // Add the user_id field that might be present at runtime
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
  
  // Check if user ID is a valid UUID
  const isValidUuid = (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };
  
  // Function to refresh permissions from the database
  const refreshPermissions = async () => {
    if (!authState.isAuthenticated || !authState.user?.id) {
      setPermissionCache({});
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Special handling for admin users by email
      if (authState.user.email === 'admin@yulu.com') {
        console.log('Default admin account detected - granting all permissions');
        const allPermissions = {
          'view:dashboard': true,
          'manage:users': true,
          'manage:issues': true,
          'manage:analytics': true,
          'manage:settings': true,
          'access:security': true,
          'create:dashboardUser': true,
          'view_analytics': true
        };
        setPermissionCache(allPermissions);
        setIsLoading(false);
        return;
      }
      
      // Special handling for non-UUID users
      if (authState.user.id === 'security-user-1' && authState.role === 'security-admin') {
        // Grant all permissions to this demo user
        console.log('Security admin demo account - granting all permissions');
        const demoPermissions = {
          'view:dashboard': true,
          'manage:users': true,
          'manage:issues': true,
          'manage:analytics': true,
          'manage:settings': true,
          'access:security': true,
          'create:dashboardUser': true,
          'view_analytics': true
        };
        setPermissionCache(demoPermissions);
        setIsLoading(false);
        return;
      }
      
      // Skip UUID validation for the developer account
      if (authState.user.email === 'sagar.km@yulu.bike') {
        // Grant all permissions to developer account
        console.log('Developer account - granting all permissions');
        const allPermissions = {
          'view:dashboard': true,
          'manage:users': true,
          'manage:issues': true,
          'manage:analytics': true,
          'manage:settings': true,
          'access:security': true,
          'create:dashboardUser': true,
          'view_analytics': true
        };
        setPermissionCache(allPermissions);
        setIsLoading(false);
        return;
      }
      
      // Check if we have a valid UUID for database operations
      // For UUID users, get all defined permissions from the database
      const allPermissions = await getPermissions();
      
      // Build a cache of all permissions for the current user
      const cache: Record<string, boolean> = {};
      
      // Safely access possible extended user properties
      const extendedUser = authState.user as ExtendedUser;
      const userIdForPermissions = extendedUser.user_id && isValidUuid(extendedUser.user_id)
        ? extendedUser.user_id
        : (isValidUuid(authState.user.id) ? authState.user.id : null);
      
      if (userIdForPermissions) {
        console.log("Using ID for permission checks:", userIdForPermissions);
        for (const perm of allPermissions) {
          // Check if the user has this permission
          const hasPermission = await checkUserPermission(userIdForPermissions, perm.name);
          cache[perm.name] = hasPermission;
        }
      } else {
        console.log("No valid UUID for permission checks, using role-based fallbacks");
        // For non-UUID users, assign permissions based on role
        for (const perm of allPermissions) {
          cache[perm.name] = false;
        }
        
        // Assign default permissions based on role
        if (authState.role === 'admin' || authState.role === 'Super Admin') {
          // Grant all permissions to admins
          console.log('Admin or Super Admin role detected - granting all permissions');
          for (const perm of allPermissions) {
            cache[perm.name] = true;
          }
        } else if (authState.role === 'security-admin') {
          console.log('Security admin role detected - granting specific permissions');
          cache['view:dashboard'] = true;
          cache['access:security'] = true;
          cache['manage:users'] = true;
        } else if (authState.role === 'HR Admin') {
          console.log('HR Admin role detected - granting specific permissions');
          cache['view:dashboard'] = true;
          cache['manage:users'] = true;
          cache['manage:issues'] = true;
          cache['create:dashboardUser'] = true;
        } else if (authState.role === 'City Head' || 
                   authState.role === 'Revenue and Ops Head' || 
                   authState.role === 'CRM' || 
                   authState.role === 'Cluster Head' || 
                   authState.role === 'Payroll Ops') {
          console.log('Management role detected - granting dashboard access');
          cache['view:dashboard'] = true;
          cache['manage:issues'] = true;
        } else if (authState.role === 'Delivery Executive' || 
                   authState.role === 'Pilot' || 
                   authState.role === 'Mechanic' || 
                   authState.role === 'Marshal' || 
                   authState.role === 'Zone Screener' || 
                   authState.role === 'Yulu Captain' || 
                   authState.role === 'employee') {
          console.log('Employee role detected - granting mobile app permissions');
          // Employees get basic permissions for mobile app functionality
          cache['view:issues'] = true;
          cache['create:issues'] = true;
          cache['submit:feedback'] = true;
        }
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
      
      // Special case for admin@yulu.com - grant all permissions
      if (authState.user?.email === 'admin@yulu.com') {
        console.log('Default admin account - granting access to:', permission);
        return true;
      }
      
      // Special case for sagar.km@yulu.bike - grant all permissions
      if (authState.user?.email === 'sagar.km@yulu.bike') {
        console.log('Developer account - granting access to:', permission);
        return true;
      }
      
      // Special case for security-user-1 demo account
      if (authState.user?.id === 'security-user-1' && authState.role === 'security-admin') {
        console.log('Security admin demo account - granting permission:', permission);
        return true;
      }
      
      // For other admin roles, grant full dashboard access
      if (authState.role === 'admin' || authState.role === 'Super Admin') {
        console.log('Admin role - granting permission:', permission);
        return true;
      }
      
      // Special handling for HR Admin role
      if (authState.role === 'HR Admin') {
        console.log('HR Admin role checking permission:', permission);
        if (permission === 'view:dashboard' || 
            permission === 'manage:users' || 
            permission === 'manage:issues' || 
            permission === 'create:dashboardUser') {
          return true;
        }
      }
      
      // For management roles, grant specific dashboard permissions
      if ((permission === 'view:dashboard' || permission === 'manage:issues') && 
          (authState.role === 'City Head' || 
           authState.role === 'Revenue and Ops Head' || 
           authState.role === 'CRM' || 
           authState.role === 'Cluster Head' || 
           authState.role === 'Payroll Ops')) {
        console.log('Management role - granting permission:', permission);
        return true;
      }
      
      // Special case for any authenticated user - can manage their assigned issues
      if (permission === 'manage:issues' && authState.isAuthenticated && authState.user?.id) {
        console.log('Authenticated user - granting access to manage assigned issues');
        return true;
      }
      
      // Check the permission cache
      return permissionCache[permission] || false;
    },
    userRole,
    isLoading,
    refreshPermissions
  }), [authState.isAuthenticated, userRole, authState.user, permissionCache, isLoading, authState.role]);
  
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
