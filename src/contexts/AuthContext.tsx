
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  session: Session | null;
  role: string;
  loading: boolean;
  status: 'authenticated' | 'unauthenticated' | 'loading'; // Add status property
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean; // Add hasPermission method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    role: '',
    loading: true,
    status: 'loading'
  });

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // User is signed in
          const userDetails = session.user;
          
          // Get user role (this is a simplified example)
          let role = 'user';
          try {
            const { data: userData } = await supabase
              .from('dashboard_users')
              .select('role')
              .eq('user_id', userDetails.id)
              .single();
            
            if (userData) {
              role = userData.role;
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
          
          setAuthState({
            isAuthenticated: true,
            user: {
              id: userDetails.id,
              email: userDetails.email || '',
              name: userDetails.user_metadata?.name || ''
            },
            session,
            role,
            loading: false,
            status: 'authenticated'
          });
        } else {
          // User is signed out
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            role: '',
            loading: false,
            status: 'unauthenticated'
          });
        }
      }
    );
    
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userDetails = session.user;
        
        // Get user role
        let role = 'user';
        try {
          const { data: userData } = await supabase
            .from('dashboard_users')
            .select('role')
            .eq('user_id', userDetails.id)
            .single();
          
          if (userData) {
            role = userData.role;
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
        
        setAuthState({
          isAuthenticated: true,
          user: {
            id: userDetails.id,
            email: userDetails.email || '',
            name: userDetails.user_metadata?.name || ''
          },
          session,
          role,
          loading: false,
          status: 'authenticated'
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          role: '',
          loading: false,
          status: 'unauthenticated'
        });
      }
    };
    
    checkSession();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      // Session will be handled by the listener
      return { error: null };
    } catch (error) {
      return { error };
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    // State will be updated by the listener
  };
  
  // Add hasPermission method
  const hasPermission = (permission: string) => {
    // Simplified permission check - in a real app, you would check against
    // stored permissions for the user's role
    if (authState.role === 'admin' || authState.role === 'Super Admin') {
      return true; // Admin has all permissions
    }
    
    // Mock permission checking logic - replace with actual permission logic
    const rolePermissions: Record<string, string[]> = {
      'Manager': ['view:dashboard', 'manage:issues', 'view:analytics'],
      'Employee': ['view:issues'],
      // Add more roles and their permissions
    };
    
    return rolePermissions[authState.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, hasPermission }}>
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
