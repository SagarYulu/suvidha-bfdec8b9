
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  employee_id?: string;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.token && response.user) {
        apiService.setToken(response.token);
        
        const newAuthState = {
          isAuthenticated: true,
          user: response.user,
          role: response.user.role,
          isLoading: false,
        };
        
        setAuthState(newAuthState);
        localStorage.setItem('authState', JSON.stringify(newAuthState));
        
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const signIn = login; // Alias for login

  const logout = async (): Promise<void> => {
    try {
      apiService.clearToken();
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        isLoading: false,
      });
      localStorage.removeItem('authState');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiService.setToken(token);
        const response = await apiService.getCurrentUser();
        
        if (response.user) {
          const newAuthState = {
            isAuthenticated: true,
            user: response.user,
            role: response.user.role,
            isLoading: false,
          };
          
          setAuthState(newAuthState);
          localStorage.setItem('authState', JSON.stringify(newAuthState));
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      console.error('Auth refresh error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        isLoading: false,
      });
      
      // Only show error if it's not a 401 (which is expected when not logged in)
      if (error.status !== 401) {
        toast.error('Session validation failed');
      }
      await logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedAuthState = localStorage.getItem('authState');
      if (storedAuthState) {
        try {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState({ ...parsedState, isLoading: true });
        } catch (error) {
          console.error('Error parsing stored auth state:', error);
        }
      }
      
      await refreshAuth();
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    authState,
    login,
    signIn,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
