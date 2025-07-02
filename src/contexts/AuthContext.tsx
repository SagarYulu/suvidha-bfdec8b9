import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authController } from '@/controllers/AuthController';
import { User, AuthState, LoginCredentials } from '@/models/User';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  authState: AuthState; // Backwards compatibility
  signIn: (email: string, password: string) => Promise<boolean>; // Backwards compatibility
  refreshAuth: () => Promise<void>; // Backwards compatibility
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('authToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    role: null,
    permissions: [],
    isLoading: true
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      const result = await authController.getCurrentUser();
      
      if (result.success && result.data) {
        setAuthState(prev => ({
          ...prev,
          user: result.data,
          isAuthenticated: true,
          role: result.data.role,
          permissions: result.data.permissions || [],
          isLoading: false
        }));
      } else {
        // Token invalid, clear auth
        await logout();
      }
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await authController.login(credentials);
      
      if (result.success && result.data) {
        setAuthState({
          user: result.data.user,
          isAuthenticated: true,
          token: result.data.token,
          refreshToken: result.data.refreshToken,
          role: result.data.user.role,
          permissions: result.data.user.permissions || [],
          isLoading: false
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const register = useCallback(async (userData: any): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await authController.register(userData);
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Account created successfully",
        });
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authController.logout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        role: null,
        permissions: [],
        isLoading: false
      });
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if API call fails
      setAuthState({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        role: null,
        permissions: [],
        isLoading: false
      });
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!authState.isAuthenticated) return;
    
    try {
      const result = await authController.getCurrentUser();
      
      if (result.success && result.data) {
        setAuthState(prev => ({
          ...prev,
          user: result.data,
          role: result.data.role,
          permissions: result.data.permissions || []
        }));
      } else {
        // User data invalid, logout
        await logout();
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      await logout();
    }
  }, [authState.isAuthenticated, logout]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const result = await authController.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });
        return true;
      } else {
        toast({
          title: "Password Change Failed",
          description: result.error || "Failed to change password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Change password error:', error);
      
      toast({
        title: "Password Change Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return false;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const result = await authController.forgotPassword(email);
      
      if (result.success) {
        toast({
          title: "Password Reset Sent",
          description: "Check your email for password reset instructions",
        });
        return true;
      } else {
        toast({
          title: "Password Reset Failed",
          description: result.error || "Failed to send password reset email",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      toast({
        title: "Password Reset Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      return false;
    }
  }, []);

  // Backwards compatibility functions
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    return login({ email, password });
  }, [login]);

  const refreshAuth = refreshUser;

  const contextValue: AuthContextType = {
    ...authState,
    authState,
    signIn,
    refreshAuth,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
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

export default AuthContext;