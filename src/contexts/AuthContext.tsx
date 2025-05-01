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
  refreshAuth: () => Promise<void>; 
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

  // Improved refreshAuth function implementation
  const refreshAuth = async (): Promise<void> => {
    try {
      console.log("Refreshing auth state...");
      
      // First check if we have a valid Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we have a Supabase session, use it
      if (session) {
        console.log("Found valid Supabase session:", session.user.email);
        // Continue using the existing session
      } else {
        console.log("No Supabase session found, checking local storage");
        // Otherwise, check localStorage for existing session
        const storedUser = localStorage.getItem("yuluUser");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            
            // Attempt to re-authenticate with Supabase silently
            if (user.email && user.password) {
              try {
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: user.email,
                  password: user.password
                });
                
                if (error) {
                  console.log("Could not restore Supabase session: ", error.message);
                } else {
                  console.log("Successfully restored Supabase session");
                }
              } catch (e) {
                console.error("Error restoring Supabase session:", e);
              }
            }
            
            setAuthState({
              isAuthenticated: true,
              user,
              role: user.role,
            });
            console.log("Refreshed user session from local storage:", user);
          } catch (error) {
            console.error("Failed to parse stored user data during refresh:", error);
            // Clear corrupted data
            localStorage.removeItem("yuluUser");
          }
        } else {
          console.log("No stored user session found during refresh");
        }
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to refresh your session. Please log in again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase auth state change:", event, session?.user?.email);
      
      // If we have a session, sync it with our local auth state
      if (session) {
        // Check for local user data that matches this email
        const storedUser = localStorage.getItem("yuluUser");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.email === session.user.email) {
              setAuthState({
                isAuthenticated: true,
                user,
                role: user.role,
              });
            }
          } catch (error) {
            console.error("Failed to parse stored user data:", error);
          }
        }
      } else if (event === "SIGNED_OUT") {
        // Clear local auth state on sign out
        setAuthState({
          isAuthenticated: false,
          user: null,
          role: null,
        });
        localStorage.removeItem("yuluUser");
      }
    });
    
    // Then check for existing session
    const initAuth = async () => {
      // Check localStorage for existing session
      const storedUser = localStorage.getItem("yuluUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          
          // Update local auth state
          setAuthState({
            isAuthenticated: true,
            user,
            role: user.role,
          });
          console.log("Restored user session:", user);
          
          // Synchronize with Supabase
          if (user.email && user.password) {
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: user.password
              });
              
              if (error) {
                console.error("Failed to restore Supabase session:", error);
              } else {
                console.log("Restored Supabase session");
              }
            } catch (e) {
              console.error("Error syncing with Supabase:", e);
            }
          }
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem("yuluUser");
        }
      }
    };
    
    initAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Logging in user:", email);
      
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
        
        // Store critical authentication data
        const userToStore = {
          ...user,
          // Make sure password is included for session restoration
          password: password 
        };
        
        localStorage.setItem("yuluUser", JSON.stringify(userToStore));
        
        toast({
          description: "Login successful!"
        });
        
        return true;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
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
      
      toast({
        description: "Logged out successfully"
      });
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
      removeRole: handleRemoveRole,
      refreshAuth
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
