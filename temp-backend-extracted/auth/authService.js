
// Authentication Service Logic
// Original file: src/services/authService.ts

const MOCK_USERS = [
  // Add your mock users data here from src/data/mockData.ts
];

const DEFAULT_ADMIN_USER = {
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

class AuthService {
  async login(email, password) {
    console.log('Login attempt:', { email });

    try {
      // Step 1: Check if it's the default admin user
      if (email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() && 
          password === DEFAULT_ADMIN_USER.password) {
        console.log('Default admin login successful');
        
        // Try to fetch actual user from dashboard_users table
        const dashboardUser = await this.fetchDashboardUser(email);
        
        if (dashboardUser) {
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

      // Step 3: Check dashboard_users table (prioritize over employees)
      console.log('User not found in mock data, checking dashboard_users table...');
      const dashboardUser = await this.fetchDashboardUserByCredentials(email, password);

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

      // Step 4: Check employees table
      console.log('User not found in dashboard_users, checking employees table...');
      const employee = await this.fetchEmployeeByCredentials(email, password);

      if (employee) {
        console.log('Employee found in database:', employee);
        
        return {
          id: employee.id,
          userId: employee.user_id || "",
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
      }
      
      console.log('No matching user found in database');
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  async fetchDashboardUser(email) {
    // Implement database query to dashboard_users table
    // SELECT * FROM dashboard_users WHERE email = ? LIMIT 1
  }

  async fetchDashboardUserByCredentials(email, password) {
    // Implement database query to dashboard_users table
    // SELECT * FROM dashboard_users WHERE email = ? AND password = ? LIMIT 1
  }

  async fetchEmployeeByCredentials(email, password) {
    // Implement database query to employees table
    // SELECT * FROM employees WHERE email = ? AND password = ? LIMIT 1
  }
}

module.exports = { AuthService, DEFAULT_ADMIN_USER };
