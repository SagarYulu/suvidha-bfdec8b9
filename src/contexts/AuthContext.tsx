
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_ADMIN_USER } from '@/services/authService';

// Define the AuthContext type
interface AuthContextType {
  authState: {
    isAuthenticated: boolean;
    user: {
      id: string;
      email: string;
      name: string;
    } | null;
    session: Session | null;
    role: string | null;
  };
  isLoading: boolean;
  user: { // Add direct user property for easier access
    id: string;
    email: string;
    name: string;
  } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>; // Add alias for login
  refreshSession: () => Promise<void>;
  refreshAuth: () => Promise<void>; // Add alias for refreshSession
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthContextType['authState']>({
    isAuthenticated: false,
    user: null,
    session: null,
    role: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { user } = session;

        // Fetch user details from the dashboard_users table
        const { data: dashboardUser, error } = await supabase
          .from('dashboard_users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error("Error fetching dashboard user:", error);
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            role: null,
          });
          return;
        }

        // Determine the user's role
        let role = dashboardUser?.role || null;

        // For the default admin user, assign the admin role
        if (user.id === DEFAULT_ADMIN_USER.id) {
          role = 'admin';
        }

        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: dashboardUser?.name || user.email,
          },
          session: session,
          role: role,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          role: null,
        });
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Alias for refreshSession
  const refreshAuth = refreshSession;

  // Initial load to check the session when the component mounts
  useEffect(() => {
    refreshSession();

    // Setup listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`);
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        refreshSession();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession]);

  // Sign-in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (session && user) {
        // Fetch user details from the dashboard_users table
        const { data: dashboardUser, error } = await supabase
          .from('dashboard_users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error("Error fetching dashboard user:", error);
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            role: null,
          });
          return;
        }

        // Determine the user's role
        let role = dashboardUser?.role || null;

        // For the default admin user, assign the admin role
        if (user.id === DEFAULT_ADMIN_USER.id) {
          role = 'admin';
        }

        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: dashboardUser?.name || user.email,
          },
          session: session,
          role: role,
        });
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      throw new Error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign-up function
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data: { session, user }, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (session && user) {
        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.email, // Default to email, can be updated later
          },
          session: session,
          role: null, // Default role
        });
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);
      throw new Error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  // Login function (alias for signIn but returns a boolean for success)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signIn(email, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Provide the auth context value
  const value: AuthContextType = {
    authState,
    isLoading,
    user: authState.user, // Add direct user access
    signIn,
    signUp,
    logout,
    login, // Add login alias
    refreshSession,
    refreshAuth, // Add refreshAuth alias
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
