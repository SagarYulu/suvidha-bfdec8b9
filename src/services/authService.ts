
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_USERS } from "@/data/mockData";

// Admin user credentials - hardcoded for demonstration purposes
export const DEFAULT_ADMIN_USER: User = {
  id: "admin-uuid-1",
  userId: "admin-001",
  name: "Admin User",
  email: "admin@yulu.com",
  phone: "1234567890",
  employeeId: "ADMIN001",
  city: "System",
  cluster: "System",
  manager: "",
  role: "admin",
  password: "admin123",
  dateOfJoining: "2023-01-01",
  bloodGroup: "",
  dateOfBirth: "",
  accountNumber: "",
  ifscCode: ""
};

// Additional authorized user with security management access
export const SECURITY_ACCESS_USER: User = {
  id: "security-user-1",
  userId: "security-001",
  name: "Sagar KM",
  email: "sagar.km@yulu.bike",
  phone: "9876543210",
  employeeId: "SEC001",
  city: "Bangalore",
  cluster: "HQ",
  manager: "",
  role: "security-admin",
  password: "123456",
  dateOfJoining: "2024-01-01",
  bloodGroup: "",
  dateOfBirth: "",
  accountNumber: "",
  ifscCode: ""
};

export const login = async (email: string, password: string): Promise<User | null> => {
  console.log('Login attempt:', { email });

  try {
    // Step 1: Check if it's the default admin user
    if (email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() && 
        password === DEFAULT_ADMIN_USER.password) {
      console.log('Default admin login successful');
      return DEFAULT_ADMIN_USER;
    }
    
    // Step 1.5: Check if it's the security access user
    if (email.toLowerCase() === SECURITY_ACCESS_USER.email.toLowerCase() && 
        password === SECURITY_ACCESS_USER.password) {
      console.log('Security access user login successful');
      return SECURITY_ACCESS_USER;
    }

    // Step 2: Check mock users (for demo accounts)
    const mockUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (mockUser) {
      console.log('User found in mock data:', mockUser);
      return mockUser;
    }

    // Step 3: Check Supabase dashboard_users table (prioritize over employees)
    console.log('User not found in mock data, checking dashboard_users table...');
    const { data: dashboardUser, error: dashboardError } = await supabase
      .from('dashboard_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .single();
    
    if (dashboardError) {
      console.log('No matching user found in dashboard_users or error occurred:', dashboardError.message);
    }

    if (dashboardUser) {
      console.log('User found in dashboard_users:', dashboardUser);
      
      // Map dashboard user to User type
      const user: User = {
        id: dashboardUser.id,
        userId: dashboardUser.user_id || "",
        name: dashboardUser.name,
        email: dashboardUser.email,
        phone: dashboardUser.phone || "",
        employeeId: dashboardUser.employee_id || "",
        city: dashboardUser.city || "",
        cluster: dashboardUser.cluster || "",
        manager: dashboardUser.manager || "",
        role: dashboardUser.role || "employee",
        password: dashboardUser.password,
        dateOfJoining: "",
        bloodGroup: "",
        dateOfBirth: "",
        accountNumber: "",
        ifscCode: ""
      };
      
      return user;
    }

    // Step 4: Check Supabase employees table
    console.log('User not found in dashboard_users, checking employees table...');
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error querying employees table:', error);
      return null;
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
      
      return user;
    }
    
    console.log('No matching user found in database');
    return null;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};
