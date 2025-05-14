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
  const [isInitializing, setIsInitializing] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0); // Added to control refresh frequency
  const [lastRefreshTime, setLastRefreshTime] = useState(0); // Track when we last refreshed

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    // Rate-limit refreshes to prevent loops
    const now = Date.now();
    if (now - lastRefreshTime < 2000) { // Don't refresh more than once every 2 seconds
      console.log("Skipping rapid session refresh", now - lastRefreshTime);
      return;
    }
    setLastRefreshTime(now);
    
    // Avoid multiple concurrent refreshes
    if (!isInitializing) {
      setIsLoading(true);
    }
    
    try {
      console.log("Refreshing session...");
      
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
            
            if (isInitializing) {
              setIsInitializing(false);
            }
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
      console.log("Supabase session check result:", session ? "Session found" : "No session");

      if (session) {
        const { user } = session;
        
        // Fetch user details but don't block on this
        let userRole: string | null = null;
        
        try {
          // Try to fetch user details from the dashboard_users table
          const { data: dashboardUser, error } = await supabase
            .from('dashboard_users')
            .select('*')
            .eq('email', user.email)
            .single();
          
          console.log("Dashboard user data:", dashboardUser, "Error:", error);
          
          if (dashboardUser) {
            userRole = dashboardUser.role || null;
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }

        // Set user state based on Supabase session
        setAuthState({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email || '',
            name: user.email?.split('@')[0] || 'Unnamed User',
          },
          session: session,
          role: userRole,
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
      if (isInitializing) {
        setIsInitializing(false);
      }
      setIsLoading(false);
    }
  }, [isInitializing, lastRefreshTime]);

  // Alias for refreshSession
  const refreshAuth = refreshSession;

  // Initial load to check the session when the component mounts
  useEffect(() => {
    console.log("AuthProvider initializing, checking session...");
    
    // Set up listener for auth changes before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`);
      // Avoid refreshSession on initialization as we call it separately
      if (!isInitializing) {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Use the forceRefresh mechanism instead of directly calling refreshSession
          setForceRefresh(prev => prev + 1);
        }
      }
    });

    // Initial session check
    refreshSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession, isInitializing]);

  // Handle forced refresh with rate limiting
  useEffect(() => {
    if (forceRefresh > 0) {
      refreshSession();
    }
  }, [forceRefresh, refreshSession]);

  // Sign-in function - tries both local auth and Supabase auth
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Starting sign-in process for:", email);
      
      // First try local authentication (for demo users)
      const localUser = await authServiceLogin(email, password);
      
      if (localUser) {
        console.log('Local authentication succeeded with:', localUser);
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
        
        // Update auth state directly instead of refreshing
        setAuthState({
          isAuthenticated: true,
          user: {
            id: localUser.id,
            email: localUser.email,
            name: localUser.name,
          },
          session: null,
          role: localUser.role,
        });
        
        setIsLoading(false);
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
        setIsLoading(false);
        return false;
      }
      
      if (data.session) {
        console.log("Supabase-only authentication succeeded");
        // We don't need to call refreshSession here - the onAuthStateChange handler will do that
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
      return false;
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

      // We don't need to call refreshSession here - the onAuthStateChange handler will do that
      setIsLoading(false);
    } catch (error: any) {
      console.error("Sign-up error:", error);
      setIsLoading(false);
      throw new Error(error.message || "Failed to sign up");
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
      
      // Update auth state explicitly
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      });
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Logout error:", error);
      setIsLoading(false);
      throw new Error(error.message || "Failed to log out");
    }
  };

  // login function (alias for signIn)
  const login = signIn;

  // Only render a loading indicator during initial load
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

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
