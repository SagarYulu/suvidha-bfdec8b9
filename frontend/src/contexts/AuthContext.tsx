
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, LoginResponse } from '@/services/api/authService';
import { User, AuthState } from '@/types';

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await authService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          user,
          role: user.role || null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response: LoginResponse = await authService.login(email, password);
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        role: response.user.role || null,
      });
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
      });
    }
  };

  const refreshAuth = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    authState,
    signIn,
    signOut,
    refreshAuth,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
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
