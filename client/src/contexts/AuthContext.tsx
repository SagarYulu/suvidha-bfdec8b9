import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/apiClient';

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

  const [authState, setAuthState] = useState(initialAuthState);
  const [isLoading, setIsLoading] = useState(false);

  // Create a mock admin user for development
  const mockAdminUser = {
    id: "admin-uuid-1",
    email: "admin@yulu.com",
    name: "Admin User"
  };

  // Update localStorage whenever authState changes
  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(authState));
  }, [authState]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        console.log("Initializing auth from stored state...");
        
        // Check if we have a stored auth state, but don't auto-login
        const savedState = localStorage.getItem('authState');
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            if (parsed.isAuthenticated && parsed.user) {
              console.log("Restoring auth state for user:", parsed.user.email);
              setAuthState(parsed);
            } else {
              console.log("No valid stored auth state found");
              setAuthState({
                isAuthenticated: false,
                user: null,
                session: null,
                role: null
              });
            }
          } catch (e) {
            console.log("Invalid stored auth state, clearing");
            localStorage.removeItem('authState');
            setAuthState({
              isAuthenticated: false,
              user: null,
              session: null,
              role: null
            });
          }
        } else {
          console.log("No stored auth state, starting fresh");
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            role: null
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          role: null
        });
      } finally {
        setIsLoading(false);
        console.log("Auth initialization complete");
      }
    };

    initializeAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Mock authentication for development
      if (email === "admin@yulu.com" && password === "admin123") {
        const user = mockAdminUser;
        setAuthState({
          isAuthenticated: true,
          user: user,
          session: { user: user },
          role: "admin"
        });
        return true;
      }
      
      // Try actual API login
      const response = await apiClient.login(email, password) as any;
      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          session: { user: response.user },
          role: response.role || "user"
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      // For now, just redirect to sign in
      throw new Error("Sign up not implemented yet");
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setAuthState({
        isAuthenticated: false,
        user: null,
        session: null,
        role: null
      });
      localStorage.removeItem('authState');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    return signIn(email, password);
  }, [signIn]);

  const refreshSession = useCallback(async (): Promise<void> => {
    // For development, keep the current session
    console.log("Refreshing session - keeping current state");
  }, []);

  const refreshAuth = useCallback(async (): Promise<void> => {
    // For development, keep the current auth state
    console.log("Refreshing auth - keeping current state");
  }, []);

  const value: AuthContextType = {
    authState,
    isLoading,
    user: authState.user,
    signIn,
    signUp,
    logout,
    login,
    refreshSession,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};