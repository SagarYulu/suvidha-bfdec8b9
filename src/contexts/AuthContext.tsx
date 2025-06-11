
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available to prevent flashing
  const initialAuthState = (() => {
    try {
      const savedState = localStorage.getItem('authState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved auth state:", e);
    }
    return { isAuthenticated: false, user: null, session: null, role: null };
  })();

  const [authState, setAuthState] = useState<AuthContextType['authState']>(initialAuthState);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to prevent duplicate calls and track initialization
  const initialized = useRef(false);
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef<number>(Date.now() - 10000); // Initialize to allow initial refresh
  
  // Function to refresh the session with debouncing and lock
  const refreshSession = useCallback(async () => {
    // Prevent concurrent refreshes or refreshing too frequently
    const now = Date.now();
    if (refreshInProgress.current || now - lastRefreshTime.current < 10000) {
      return;
    }
    
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    try {
      console.log("Refreshing auth session...");
      setIsLoading(true);
      
      // Check for mock user first
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          if (mockUser && mockUser.email) {
            const newAuthState = {
              isAuthenticated: true,
              user: {
                id: mockUser.id || `mock-${Date.now()}`,
                email: mockUser.email,
                name: mockUser.name || mockUser.email.split('@')[0],
              },
              session: null,
              role: mockUser.role || 'user',
            };
            
            setAuthState(newAuthState);
            localStorage.setItem('authState', JSON.stringify(newAuthState));
            setIsLoading(false);
            refreshInProgress.current = false;
            return;
          }
        } catch (e) {
          console.error("Error parsing mock user:", e);
          localStorage.removeItem('mockUser');
        }
      }

      // If no mock user, check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { user } = session;
        let userRole: string | null = null;
        
        try {
          const { data: dashboardUser } = await supabase
            .from('dashboard_users')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (dashboardUser) {
            userRole = dashboardUser.role || null;
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }

        const newAuthState = {
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email || '',
            name: user.email?.split('@')[0] || 'Unnamed User',
          },
          session: session,
          role: userRole,
        };
        
        setAuthState(newAuthState);
        localStorage.setItem('authState', JSON.stringify(newAuthState));
      } else {
        // No session found
        const newAuthState = {
          isAuthenticated: false,
          user: null,
          session: null,
          role: null,
        };
        
        setAuthState(newAuthState);
        localStorage.removeItem('authState');
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      });
      localStorage.removeItem('authState');
    } finally {
      setIsLoading(false);
      refreshInProgress.current = false;
    }
  }, []);

  // Alias for refreshSession
  const refreshAuth = refreshSession;

  // Set up auth change listener only once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log("Setting up auth change listener...");
    
    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`);
      
      // Handle only significant auth events to prevent loops
      if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        // Use timeout to debounce multiple rapid auth change events
        setTimeout(() => {
          // Only refresh if not recently refreshed
          if (Date.now() - lastRefreshTime.current > 5000) {
            refreshSession();
          }
        }, 100);
      }
    });

    // Initial session check only once at startup
    refreshSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession]);

  // Sign-in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Try local authentication first
      const localUser = await authServiceLogin(email, password);
      
      if (localUser) {
        // Local auth success
        try {
          // Also try Supabase auth but don't fail if it doesn't work
          await supabase.auth.signInWithPassword({
            email,
            password
          }).catch(error => {
            console.log("Supabase auth failed, using local auth:", error);
          });
        } catch (error) {
          console.log("Supabase auth error:", error);
        }
        
        // Store mock user for session persistence
        localStorage.setItem('mockUser', JSON.stringify({
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          role: localUser.role
        }));
        
        // Update auth state directly
        const newAuthState = {
          isAuthenticated: true,
          user: {
            id: localUser.id,
            email: localUser.email,
            name: localUser.name,
          },
          session: null,
          role: localUser.role,
        };
        
        setAuthState(newAuthState);
        localStorage.setItem('authState', JSON.stringify(newAuthState));
        
        setIsLoading(false);
        return true;
      }
      
      // Try Supabase-only auth if local auth failed
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
        // Let the auth change event handle state updates
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
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
      
      // Clear local storage first
      localStorage.removeItem('mockUser');
      localStorage.removeItem('authState');
      
      // Then sign out from Supabase
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

  // Provide the auth context value
  const value: AuthContextType = {
    authState,
    isLoading,
    user: authState.user,
    signIn,
    signUp,
    logout,
    login,
    refreshSession,
    refreshAuth,
  };

  // Simple loading spinner shown only during authentication operations
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
