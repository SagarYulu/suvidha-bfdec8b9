
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, Employee } from '@/services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  employee: Employee | null;
  role: string | null;
  loading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string, isEmployee?: boolean) => Promise<boolean>;
  signOut: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    employee: null,
    role: null,
    loading: true,
  });

  const signIn = async (email: string, password: string, isEmployee = false): Promise<boolean> => {
    try {
      if (isEmployee) {
        const { employee } = await authService.employeeLogin({ employeeId: email, password });
        setAuthState({
          isAuthenticated: true,
          user: null,
          employee,
          role: 'employee',
          loading: false,
        });
      } else {
        const { user } = await authService.adminLogin({ email, password });
        setAuthState({
          isAuthenticated: true,
          user,
          employee: null,
          role: user.role,
          loading: false,
        });
      }
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const signOut = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      employee: null,
      role: null,
      loading: false,
    });
  };

  const refreshAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const user = authService.getStoredUser();
        const employee = authService.getStoredEmployee();
        
        if (user) {
          setAuthState({
            isAuthenticated: true,
            user,
            employee: null,
            role: user.role,
            loading: false,
          });
        } else if (employee) {
          setAuthState({
            isAuthenticated: true,
            user: null,
            employee,
            role: 'employee',
            loading: false,
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          employee: null,
          role: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      signOut();
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, signIn, signOut, refreshAuth }}>
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
