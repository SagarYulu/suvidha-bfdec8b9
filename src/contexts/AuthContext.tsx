
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { MOCK_USERS } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
  });

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("yuluUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          role: user.role,
        });
        console.log("Restored user session:", user);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("yuluUser");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { email, password }); // Added logging

    // Log all mock users for debugging
    console.log('Available mock users:', MOCK_USERS);

    // Find user with exact match, case-sensitive
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      console.log('User found:', user); // Added logging for successful match
      setAuthState({
        isAuthenticated: true,
        user,
        role: user.role,
      });
      localStorage.setItem("yuluUser", JSON.stringify(user));
      return true;
    } else {
      console.log('No matching user found'); // Added logging for failed login
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
    });
    localStorage.removeItem("yuluUser");
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
