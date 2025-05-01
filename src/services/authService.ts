
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
  console.log('Login attempt:', { email, password });

  try {
    // Step 1: Check if it's the admin user
    if (email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() && 
        password === DEFAULT_ADMIN_USER.password) {
      console.log('Default admin login successful');
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

    // Step 3: Check Supabase employees table
    console.log('User not found in mock data, checking database...');
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
