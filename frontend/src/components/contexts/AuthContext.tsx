
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/services/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  permissions: string[];
}

interface AuthContextType {
  authState: AuthState;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    role: null,
    permissions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authState.token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await ApiClient.get('/api/auth/me');
      const user = response.data;
      
      setAuthState(prev => ({
        ...prev,
        user,
        role: user.role,
        permissions: user.permissions || []
      }));
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        token: null,
        role: null,
        permissions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiClient.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        role: user.role,
        permissions: user.permissions || []
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await ApiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        token: null,
        role: null,
        permissions: []
      });
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await ApiClient.post('/api/auth/refresh');
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setAuthState(prev => ({ ...prev, token }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      authState,
      user: authState.user,
      isLoading,
      login,
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
