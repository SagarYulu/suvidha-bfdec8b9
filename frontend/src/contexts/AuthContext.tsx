
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';

interface AuthContextType {
  authState: {
    isAuthenticated: boolean;
    user: {
      id: string;
      email: string;
      name: string;
    } | null;
    role: string | null;
  };
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthContextType['authState']>({
    isAuthenticated: false,
    user: null,
    role: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setAuthState({
        isAuthenticated: true,
        user,
        role: user.role || null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          role: response.user.role || null,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    authState,
    isLoading,
    user: authState.user,
    login,
    logout,
    refreshAuth,
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
