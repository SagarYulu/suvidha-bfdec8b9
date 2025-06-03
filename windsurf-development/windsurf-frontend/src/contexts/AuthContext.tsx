
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

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
        };
        
        setAuthState(newAuthState);
        localStorage.setItem('authState', JSON.stringify(newAuthState));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signIn = login; // Alias for login

  const logout = async (): Promise<void> => {
    apiService.clearToken();
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
    });
    localStorage.removeItem('authState');
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
          };
          
          setAuthState(newAuthState);
          localStorage.setItem('authState', JSON.stringify(newAuthState));
        }
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      await logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedAuthState = localStorage.getItem('authState');
      if (storedAuthState) {
        try {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState(parsedState);
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
