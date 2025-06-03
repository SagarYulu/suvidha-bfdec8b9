
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  loading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  employeeLogin: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const authState: AuthState = {
    isAuthenticated: !!user,
    user,
    role: user?.role || null,
    loading
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await authService.verifyToken();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const employeeLogin = async (employeeId: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.employeeLogin(employeeId, password);
      setUser(response.employee);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.employee));
      return true;
    } catch (error) {
      console.error('Employee login failed:', error);
      return false;
    }
  };

  const signIn = login; // Alias for compatibility

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const refreshAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await authService.verifyToken();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout();
    }
  };

  const value = {
    authState,
    user,
    login,
    employeeLogin,
    logout,
    loading,
    signIn,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
