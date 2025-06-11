
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Refreshing auth session...');
    refreshSession();
  }, []);

  const refreshSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Mock user for demo - replace with actual API call
        const mockUser = {
          id: 'admin-uuid-1',
          name: 'Admin User',
          email: 'admin@yulu.com',
          phone: '+91-9876543210',
          employeeId: 'EMP001',
          role: 'admin',
          manager: '',
          cluster: 'Delhi NCR',
          city: 'Delhi',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('User is authenticated:', { id: mockUser.id, email: mockUser.email, name: mockUser.name });
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock login - replace with actual API call
      if (email === 'admin@yulu.com' && password === 'admin123') {
        const token = 'mock-jwt-token';
        localStorage.setItem('auth_token', token);
        await refreshSession();
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
