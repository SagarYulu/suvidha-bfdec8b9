
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/api/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  isLoading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
    isLoading: true,
  });

  // Check for existing authentication on mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await authService.verifyToken();
      if (response.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          role: response.user.role,
          isLoading: false,
        });
        
        // Store user data for compatibility
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          user: response.user,
          role: response.user.role,
        }));
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authState');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      let response;
      
      // Try employee login first (email + employeeId)
      try {
        response = await authService.employeeLogin({ email, employeeId: password });
      } catch (employeeError) {
        // If employee login fails, try admin login
        response = await authService.login({ email, password });
      }

      if (response.success && response.token) {
        localStorage.setItem('authToken', response.token);
        
        const newAuthState = {
          isAuthenticated: true,
          user: response.user,
          role: response.user.role,
          isLoading: false,
        };
        
        setAuthState(newAuthState);
        
        // Store for compatibility
        localStorage.setItem('authState', JSON.stringify(newAuthState));
        localStorage.setItem('mockUser', JSON.stringify(response.user));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Alias for login to maintain compatibility
  const signIn = login;

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authState');
      localStorage.removeItem('mockUser');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        isLoading: false,
      });
    }
  };

  const refreshAuth = async (): Promise<void> => {
    await checkExistingAuth();
  };

  const value: AuthContextType = {
    authState,
    login,
    signIn,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
