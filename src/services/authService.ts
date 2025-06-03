
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

export const login = async (email: string, password: string): Promise<User | null> => {
  console.log('Login attempt:', { email });

  try {
    // Step 1: Check if it's the default admin user
    if (email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() && 
        password === DEFAULT_ADMIN_USER.password) {
      console.log('Default admin login successful');
      
      // Try to fetch actual user from dashboard_users table
      const { data: dashboardUser, error } = await supabase
        .from('dashboard_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
        
      if (!error && dashboardUser) {
        console.log('Found matching dashboard user:', dashboardUser);
        return {
          ...DEFAULT_ADMIN_USER,
          id: dashboardUser.id,
        };
      }
      
      return DEFAULT_ADMIN_USER;
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
      .maybeSingle();
    
    if (dashboardError) {
      console.log('No matching user found in dashboard_users or error occurred:', dashboardError.message);
    }

    if (dashboardUser) {
      console.log('User found in dashboard_users:', dashboardUser);
      
      return {
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
    }

    // Step 4: Check Supabase employees table - UPDATED to accept employee ID as password
    console.log('User not found in dashboard_users, checking employees table...');
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error querying employees table:', error);
    }

    if (employees) {
      console.log('Employee found in database:', employees);
      
      // Check if password matches employee ID OR the default 'password'
      const isValidPassword = password === employees.emp_id || 
                             password === 'password';
      
      if (!isValidPassword) {
        console.log('Invalid password for employee:', { provided: password, expected: employees.emp_id });
        return null;
      }
      
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
        role: employees.role || "employee",
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
