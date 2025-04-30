
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  authState: AuthState;
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
    console.log('Login attempt:', { email });

    try {
      // First try to authenticate as an admin user
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase());
      
      if (adminError) {
        console.error('Error fetching admin users:', adminError);
        return false;
      }
      
      console.log('Admin users query result:', adminUsers);
      
      if (adminUsers && adminUsers.length > 0) {
        const adminUser = adminUsers[0];
        console.log('Admin user found:', adminUser);
        
        // Validate password
        if (adminUser.password !== password) {
          console.log('Invalid admin password');
          return false;
        }
        
        // Map Supabase admin to User type
        const user: User = {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          phone: "",
          employeeId: adminUser.emp_id || "",
          city: "",
          cluster: "",
          manager: "",
          role: adminUser.role, // This will be 'hr_admin', 'city_head', or 'ops'
          password: adminUser.password,
        };
        
        setAuthState({
          isAuthenticated: true,
          user,
          role: user.role,
        });
        localStorage.setItem("yuluUser", JSON.stringify(user));
        console.log("Admin login successful:", user);
        return true;
      }
      
      // If not an admin, try to authenticate as an employee
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email.toLowerCase());
      
      if (error) {
        console.error('Error fetching employee:', error);
        return false;
      }
      
      console.log('Employee query result:', employees);
      
      if (!employees || employees.length === 0) {
        console.log('No user found with this email');
        return false;
      }
      
      const employee = employees[0];
      
      // Validate password
      if (employee.password !== password) {
        console.log('Invalid password');
        return false;
      }
      
      console.log('Employee found:', employee);
      
      // Map Supabase employee to User type
      const user: User = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone || "",
        employeeId: employee.emp_id,
        city: employee.city || "",
        cluster: employee.cluster || "",
        manager: employee.manager || "",
        role: employee.role || "employee",
        password: employee.password,
        dateOfJoining: employee.date_of_joining || "",
        bloodGroup: employee.blood_group || "",
        dateOfBirth: employee.date_of_birth || "",
        accountNumber: employee.account_number || "",
        ifscCode: employee.ifsc_code || ""
      };
      
      setAuthState({
        isAuthenticated: true,
        user,
        role: user.role,
      });
      localStorage.setItem("yuluUser", JSON.stringify(user));
      console.log("Employee login successful:", user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
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

  // Provide the context value to children
  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
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
