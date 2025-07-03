
import { User } from "@/types";
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
      try {
        const { data: dashboardUser, error } = await supabase
          .from('dashboard_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .maybeSingle(); // Use maybeSingle() instead of single()
          
        if (!error && dashboardUser) {
          console.log('Found matching dashboard user:', dashboardUser);
          return {
            ...DEFAULT_ADMIN_USER,
            id: dashboardUser.id,
          };
        }
      } catch (error) {
        console.log('Error fetching dashboard user:', error);
      }
      
      return DEFAULT_ADMIN_USER;
    }
    
    // Step 2: Check mock users (for demo accounts)
    const mockUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && 
      (u.password === password || u.employeeId === password)
    );

    if (mockUser) {
      console.log('User found in mock data:', mockUser);
      return mockUser;
    }

    // Step 3: Check dashboard_users table (prioritize over employees)
    console.log('User not found in mock data, checking dashboard_users table...');
    try {
      const { data: dashboardUsers, error: dashboardError } = await supabase
        .from('dashboard_users')
        .select('*')
        .eq('email', email.toLowerCase());
      
      if (!dashboardError && dashboardUsers && dashboardUsers.length > 0) {
        // Check if any user matches the password or employee_id
        const matchingUser = dashboardUsers.find(user => 
          user.password === password || user.employee_id === password
        );
        
        if (matchingUser) {
          console.log('User found in dashboard_users:', matchingUser);
          
          return {
            id: matchingUser.id,
            userId: matchingUser.user_id || "",
            name: matchingUser.name,
            email: matchingUser.email,
            phone: matchingUser.phone || "",
            employeeId: matchingUser.employee_id || "",
            city: matchingUser.city || "",
            cluster: matchingUser.cluster || "",
            manager: matchingUser.manager || "",
            role: matchingUser.role || "employee",
            password: matchingUser.password,
            dateOfJoining: "",
            bloodGroup: "",
            dateOfBirth: "",
            accountNumber: "",
            ifscCode: ""
          };
        }
      }
    } catch (error) {
      console.log('Error querying dashboard_users:', error);
    }

    // Step 4: Check employees table
    console.log('User not found in dashboard_users, checking employees table...');
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email.toLowerCase());

      if (!error && employees && employees.length > 0) {
        // Check if any employee matches the password or emp_id
        const matchingEmployee = employees.find(emp => 
          emp.password === password || emp.emp_id === password
        );
        
        if (matchingEmployee) {
          console.log('Employee found in database:', matchingEmployee);
          
          return {
            id: matchingEmployee.id,
            userId: matchingEmployee.user_id || "",
            name: matchingEmployee.name,
            email: matchingEmployee.email,
            phone: matchingEmployee.phone || "",
            employeeId: matchingEmployee.emp_id,
            city: matchingEmployee.city || "",
            cluster: matchingEmployee.cluster || "",
            manager: matchingEmployee.manager || "",
            role: matchingEmployee.role || "employee",
            password: matchingEmployee.password,
            dateOfJoining: matchingEmployee.date_of_joining || "",
            bloodGroup: matchingEmployee.blood_group || "",
            dateOfBirth: matchingEmployee.date_of_birth || "",
            accountNumber: matchingEmployee.account_number || "",
            ifscCode: matchingEmployee.ifsc_code || ""
          };
        }
      }
    } catch (error) {
      console.log('Error querying employees table:', error);
    }
    
    console.log('No matching user found in any database');
    return null;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};
