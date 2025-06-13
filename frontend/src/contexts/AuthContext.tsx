
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@/services/authService';

// Define the AuthContext type
interface AuthContextType {
  authState: {
    isAuthenticated: boolean;
    user: {
      id: string;
      email: string;
      name: string;
    } | null;
    session: any;
    role: string | null;
  };
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  signIn: (email: string, password: string, isAdminLogin?: boolean) => Promise<boolean>;
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
  const [authState, setAuthState] = useState<AuthContextType['authState']>({
    isAuthenticated: false,
    user: null,
    session: null,
    role: null
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to prevent duplicate calls and track initialization
  const initialized = useRef(false);
  
  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      console.log("Checking for existing session...");
      setIsLoading(true);
      
      // Check for stored user from previous login
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          console.log('Found stored user session:', user);
          
          const newAuthState = {
            isAuthenticated: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.full_name || user.name || user.email.split('@')[0],
            },
            session: { token },
            role: user.role,
          };
          
          setAuthState(newAuthState);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
      }

      // No session found
      const newAuthState = {
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      };
      
      setAuthState(newAuthState);
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

  // Set up auth on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log("Initializing auth state...");
    refreshSession();
  }, [refreshSession]);

  // Sign-in function
  const signIn = async (email: string, password: string, isAdminLogin = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with backend API:', { email, isAdminLogin });
      
      // Use the auth service to login
      const response = await authService.login(email, password, isAdminLogin);
      
      if (response.user && response.token) {
        console.log('Login successful:', response.user);
        
        // Store user and token
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        
        // Update auth state
        const newAuthState = {
          isAuthenticated: true,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.full_name || response.user.name || response.user.email.split('@')[0],
          },
          session: { token: response.token },
          role: response.user.role,
        };
        
        setAuthState(newAuthState);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Sign-up function (placeholder for future implementation)
  const signUp = async (email: string, password: string) => {
    throw new Error("Sign-up not implemented yet. Please contact admin.");
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      
      // Try to logout from backend
      try {
        await authService.logout();
      } catch (error) {
        console.error("Backend logout error:", error);
      }
      
      // Update auth state
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

  // login function (alias for signIn with 2 parameters only)
  const login = async (email: string, password: string): Promise<boolean> => {
    return signIn(email, password, false);
  };

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
