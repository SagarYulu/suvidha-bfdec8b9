
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { MOCK_USERS } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  authState: AuthState;
  user: User | null; // Added user property
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the provider component
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
    console.log('Login attempt:', { email, password });

    try {
      // Step 1: Check mock users first (for admin and demo accounts)
      console.log('Available mock users:', MOCK_USERS);
      const mockUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (mockUser) {
        console.log('User found in mock data:', mockUser);
        setAuthState({
          isAuthenticated: true,
          user: mockUser,
          role: mockUser.role,
        });
        localStorage.setItem("yuluUser", JSON.stringify(mockUser));
        return true;
      }

      // Step 2: If not found in mock data, check Supabase employees table
      console.log('User not found in mock data, checking database...');
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password', password)
        .single();

      if (error) {
        console.error('Error querying employees table:', error);
        return false;
      }

      if (employees) {
        console.log('Employee found in database:', employees);
        
        // Map database employee to User type
        const user: User = {
          id: employees.id,
          userId: employees.user_id || "",
          name: employees.name,
          email: employees.email,
          phone: employees.phone || "",
          employeeId: employees.emp_id,
          city: employees.city || "",
          cluster: employees.cluster || "",
          manager: employees.manager || "",
          role: employees.role || "employee", // Default to employee role
          password: employees.password,
          dateOfJoining: employees.date_of_joining || "",
          bloodGroup: employees.blood_group || "",
          dateOfBirth: employees.date_of_birth || "",
          accountNumber: employees.account_number || "",
          ifscCode: employees.ifsc_code || ""
        };
        
        setAuthState({
          isAuthenticated: true,
          user,
          role: user.role,
        });
        localStorage.setItem("yuluUser", JSON.stringify(user));
        return true;
      }
      
      console.log('No matching user found in database');
      return false;
    } catch (error) {
      console.error("Login error:", error);
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

  // Provide the context value to children, now including user directly
  return (
    <AuthContext.Provider value={{ 
      authState, 
      user: authState.user, // Expose user directly from authState 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
