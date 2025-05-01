
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { login as authLogin, DEFAULT_ADMIN_USER } from "@/services/authService";
import { checkUserRole, assignRole, removeRole } from "@/services/roleService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
        
        // Sign in with Supabase using stored credentials to maintain session
        if (user.email && user.password) {
          supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          }).then(({ data, error }) => {
            if (error) {
              console.error("Failed to restore Supabase session:", error);
            } else {
              console.log("Restored Supabase session");
            }
          });
        }
        
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
    
    // Also listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase auth state change:", event, session?.user?.email);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First try to sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error("Supabase auth error:", authError);
        // Continue with mock login as fallback
      } else {
        console.log("Supabase auth success:", authData);
      }
      
      // Proceed with the existing login flow
      const user = await authLogin(email, password);
      
      if (user) {
        // Check if the user has admin role in the database
        if (user.role !== 'admin') {
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
    } catch (error) {
      console.error("Login error:", error);
    }
    
    return false;
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out of Supabase:", error);
      }
    } catch (error) {
      console.error("Error in logout:", error);
    } finally {
      // Always clean up local state regardless of Supabase errors
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
      });
      localStorage.removeItem("yuluUser");
      console.log("User logged out");
    }
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
