
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: string;
  full_name: string;
  name: string; // Add name property for compatibility
  email: string;
  role: string;
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
  cluster_id?: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: string | null;
}

interface AuthContextType {
  authState: AuthState;
  user: User | null; // Add user property for direct access
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAuth: () => Promise<void>; // Add refreshAuth method
  isLoading: boolean;
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
    user: null,
    isAuthenticated: false,
    role: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await authService.getCurrentUser();
        // Ensure name property exists for compatibility
        const userWithName = {
          ...user,
          name: user.name || user.full_name
        };
        setAuthState({
          user: userWithName,
          isAuthenticated: true,
          role: userWithName.role
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, isAdminLogin = false) => {
    try {
      const { user, token } = await authService.login(email, password, isAdminLogin);
      localStorage.setItem('authToken', token);
      // Ensure name property exists for compatibility
      const userWithName = {
        ...user,
        name: user.name || user.full_name
      };
      setAuthState({
        user: userWithName,
        isAuthenticated: true,
        role: userWithName.role
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setAuthState({
        user: null,
        isAuthenticated: false,
        role: null
      });
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      // Ensure name property exists for compatibility
      const userWithName = {
        ...user,
        name: user.name || user.full_name
      };
      setAuthState(prev => ({
        ...prev,
        user: userWithName,
        role: userWithName.role
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    authState,
    user: authState.user, // Add direct user access
    login,
    logout,
    refreshUser,
    refreshAuth, // Add refreshAuth method
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
