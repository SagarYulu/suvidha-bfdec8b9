
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '@/types';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  permissions: string[];
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  authState: AuthState;
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; role: string; permissions: string[] } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  permissions: [],
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.role,
        permissions: action.payload.permissions,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        role: null,
        permissions: [],
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin',
        city: 'Bangalore',
        cluster: 'South',
        manager: 'System Manager',
        permissions: ['read:users', 'write:users', 'read:issues', 'write:issues'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: mockUser,
          role: mockUser.role,
          permissions: mockUser.permissions || [],
        },
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const refreshAuth = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock refresh - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    authState: state,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    role: state.role,
    isLoading: state.isLoading,
    login,
    logout,
    updateUser,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
