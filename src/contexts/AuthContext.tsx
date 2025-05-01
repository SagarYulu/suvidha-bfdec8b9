
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { login as authLogin, DEFAULT_ADMIN_USER } from "@/services/authService";
import { checkUserRole, assignRole, removeRole } from "@/services/roleService";

interface AuthContextType {
  authState: AuthState;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkUserRole: (userId: string, role: string) => Promise<boolean>;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  removeRole: (userId: string, role: string) => Promise<boolean>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
  });

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("yuluUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          role: user.role,
        });
        console.log("Restored user session:", user);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("yuluUser");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await authLogin(email, password);
    
    if (user) {
      // Allow users with admin or ops_head role for dashboard access
      if (user.role !== 'admin' && user.role !== 'ops_head') {
        const hasAdminRole = await checkUserRole(user.id, 'admin');
        if (hasAdminRole) {
          user.role = 'admin';
        }
      }
      
      setAuthState({
        isAuthenticated: true,
        user,
        role: user.role,
      });
      localStorage.setItem("yuluUser", JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
    });
    localStorage.removeItem("yuluUser");
    console.log("User logged out");
  };

  const handleCheckUserRole = async (userId: string, role: string): Promise<boolean> => {
    return await checkUserRole(userId, role);
  };

  const handleAssignRole = async (userId: string, role: string): Promise<boolean> => {
    return await assignRole(userId, role, authState.role);
  };

  const handleRemoveRole = async (userId: string, role: string): Promise<boolean> => {
    return await removeRole(userId, role, authState.role);
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={{ 
      authState, 
      user: authState.user,
      login, 
      logout,
      checkUserRole: handleCheckUserRole,
      assignRole: handleAssignRole,
      removeRole: handleRemoveRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
