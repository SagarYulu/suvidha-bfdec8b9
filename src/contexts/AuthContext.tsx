
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@/services/api/authService';

// Define the AuthContext type
interface AuthContextType {
  authState: {
    isAuthenticated: boolean;
    user: {
      id: string;
      email: string;
      name: string;
    } | null;
    session: any | null;
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
      
      // Check for stored auth token first
      const savedAuthState = localStorage.getItem('authState');
      if (savedAuthState) {
        try {
          const parsed = JSON.parse(savedAuthState);
          if (parsed && parsed.token) {
            // Try to get current user with the stored token
            try {
              const user = await authService.getCurrentUser();
              const newAuthState = {
                isAuthenticated: true,
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                },
                session: { token: parsed.token },
                role: user.role,
              };
              
              setAuthState(newAuthState);
              localStorage.setItem('authState', JSON.stringify(newAuthState));
              setIsLoading(false);
              refreshInProgress.current = false;
              return;
            } catch (error) {
              console.log("Token validation failed, clearing auth state");
              localStorage.removeItem('authState');
            }
          }
        } catch (e) {
          console.error("Error parsing saved auth state:", e);
          localStorage.removeItem('authState');
        }
      }

      // No valid session found
      const newAuthState = {
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      };
      
      setAuthState(newAuthState);
      localStorage.removeItem('authState');
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

  // Set up auth check only once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log("Setting up auth initialization...");
    
    // Initial session check only once at startup
    refreshSession();
  }, [refreshSession]);

  // Sign-in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log("Attempting login with backend API...");
      const response = await authService.login({ email, password });
      
      if (response && response.user && response.token) {
        // Store token and user data
        const newAuthState = {
          isAuthenticated: true,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
          },
          session: { token: response.token },
          role: response.user.role,
          token: response.token, // Also store token at root level for compatibility
        };
        
        setAuthState(newAuthState);
        localStorage.setItem('authState', JSON.stringify(newAuthState));
        
        console.log("Login successful");
        setIsLoading(false);
        return true;
      }
      
      console.log("Login failed - no valid response");
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
      
      await authService.register({
        email,
        password,
        name: email.split('@')[0], // Default name from email
        role: 'employee', // Default role
      });
      
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
      localStorage.removeItem('authState');
      
      // Try to logout from backend (but don't fail if it doesn't work)
      try {
        await authService.logout();
      } catch (error) {
        console.warn("Backend logout failed, but continuing with local logout");
      }
      
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
