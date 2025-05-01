
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { login as authServiceLogin } from '@/services/authService';

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
  user: { // Direct user property for easier access
    id: string;
    email: string;
    name: string;
  } | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>; // Alias for signIn
  refreshSession: () => Promise<void>;
  refreshAuth: () => Promise<void>; // Alias for refreshSession
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
      
      // Check if we have a mock user in localStorage (for demo purposes)
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          console.log("Found mockUser in localStorage:", mockUser);
          
          if (mockUser && mockUser.email) {
            // Valid mock user found
            setAuthState({
              isAuthenticated: true,
              user: {
                id: mockUser.id || `mock-${Date.now()}`,
                email: mockUser.email,
                name: mockUser.name || mockUser.email.split('@')[0],
              },
              session: null, // No Supabase session for mock users
              role: mockUser.role || 'user',
            });
            setIsLoading(false);
            return; // Exit early
          }
        } catch (e) {
          console.error("Error parsing mock user:", e);
          localStorage.removeItem('mockUser'); // Clear invalid data
        }
      }

      // If no mock user found, check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Supabase session:", session);

      if (session) {
        const { user } = session;
        
        // Try to fetch user details from the dashboard_users table
        const { data: dashboardUser, error } = await supabase
          .from('dashboard_users')
          .select('*')
          .eq('email', user.email)
          .single();
        
        console.log("Dashboard user data:", dashboardUser, "Error:", error);

        // Set user state based on Supabase session
        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email || '',
            name: dashboardUser?.name || user.email || 'Unnamed User',
          },
          session: session,
          role: dashboardUser?.role || null,
        });
      } else {
        // No mock user and no Supabase session, user is not authenticated
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
    console.log("AuthProvider initializing, checking session...");
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

  // Sign-in function - tries both local auth and Supabase auth
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Starting sign-in process for:", email);
      
      // First try local authentication (for demo users)
      const localUser = await authServiceLogin(email, password);
      
      if (localUser) {
        console.log("Local authentication succeeded with:", localUser);
        // Local auth success, try Supabase auth but don't fail if it doesn't work
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!error && data.session) {
            console.log("Supabase authentication also succeeded");
          } else {
            console.log("Supabase authentication failed, but using local auth instead");
          }
        } catch (error) {
          console.log("Supabase authentication error, falling back to local auth:", error);
        }
        
        // Store mock user in localStorage for persistent session
        localStorage.setItem('mockUser', JSON.stringify({
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          role: localUser.role
        }));
        
        // Refresh auth state to update the UI
        await refreshSession();
        return true;
      }
      
      // If local auth failed, try Supabase-only authentication
      console.log("Local authentication failed, trying Supabase-only authentication");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Supabase authentication error:", error);
        return false;
      }
      
      if (data.session) {
        console.log("Supabase-only authentication succeeded");
        await refreshSession();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Sign-in error:", error);
      return false;
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
        await refreshSession();
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
      
      // Clear mock user from localStorage
      localStorage.removeItem('mockUser');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Update auth state
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

  // login function (alias for signIn)
  const login = signIn;

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

  // Only render children once initial auth check is complete
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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
