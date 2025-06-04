
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

interface RBACContextType {
  user: User | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
};

interface RBACProviderProps {
  children: ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage (independent of Supabase)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        // Set default permissions based on role
        const roles = getRolesForUser(userData.role || 'employee');
        setUser({
          ...userData,
          roles
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const getRolesForUser = (userRole: string): Role[] => {
    // Define default roles and permissions (independent of database)
    const roleDefinitions: Record<string, Role> = {
      admin: {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        permissions: [
          { id: 'view_dashboard', name: 'view_dashboard' },
          { id: 'manage_users', name: 'manage_users' },
          { id: 'manage_issues', name: 'manage_issues' },
          { id: 'view_analytics', name: 'view_analytics' },
          { id: 'export_data', name: 'export_data' },
          { id: 'manage_roles', name: 'manage_roles' },
          { id: 'view_audit_trail', name: 'view_audit_trail' }
        ]
      },
      manager: {
        id: 'manager',
        name: 'Manager',
        description: 'Team management access',
        permissions: [
          { id: 'view_dashboard', name: 'view_dashboard' },
          { id: 'manage_issues', name: 'manage_issues' },
          { id: 'view_analytics', name: 'view_analytics' },
          { id: 'export_data', name: 'export_data' },
          { id: 'view_audit_trail', name: 'view_audit_trail' }
        ]
      },
      support: {
        id: 'support',
        name: 'Support Agent',
        description: 'Issue management access',
        permissions: [
          { id: 'view_dashboard', name: 'view_dashboard' },
          { id: 'manage_issues', name: 'manage_issues' },
          { id: 'view_audit_trail', name: 'view_audit_trail' }
        ]
      },
      employee: {
        id: 'employee',
        name: 'Employee',
        description: 'Basic access',
        permissions: [
          { id: 'view_dashboard', name: 'view_dashboard' },
          { id: 'create_issues', name: 'create_issues' },
          { id: 'view_own_issues', name: 'view_own_issues' }
        ]
      }
    };

    return [roleDefinitions[userRole] || roleDefinitions.employee];
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => 
      role.permissions.some(p => p.name === permission)
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => role.name === roleName);
  };

  const value: RBACContextType = {
    user,
    hasPermission,
    hasRole,
    loading
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};
