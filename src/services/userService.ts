
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Keep a local cache of users for faster access
let users: User[] = [];

// Function to map Supabase employee to User type
const mapEmployeeToUser = (employee: any): User => {
  return {
    id: String(employee.id), // Ensure ID is always handled as string
    name: employee.name,
    email: employee.email,
    phone: employee.phone || "",
    employeeId: employee.emp_id,
    city: employee.city || "",
    cluster: employee.cluster || "",
    manager: employee.manager || "",
    role: employee.role || "",
    password: employee.password,
    dateOfJoining: employee.date_of_joining || "",
    bloodGroup: employee.blood_group || "",
    dateOfBirth: employee.date_of_birth || "",
    accountNumber: employee.account_number || "",
    ifscCode: employee.ifsc_code || ""
  };
};

// Initialize: Load users from Supabase
const initializeUsers = async (): Promise<void> => {
  try {
    const { data: employees, error } = await supabase.from('employees').select('*');
    
    if (error) {
      console.error("Error loading employees from Supabase:", error);
      return;
    }

    if (employees && employees.length > 0) {
      users = employees.map(mapEmployeeToUser);
      console.log(`Loaded ${users.length} users from Supabase employees table`);
    } else {
      // If no employees in database, initialize with empty array - no mock data
      console.log("No employees found in database");
      users = [];
    }
  } catch (error) {
    console.error("Error initializing users from Supabase:", error);
  }
};

// Initialize users on service load
initializeUsers();

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data: employees, error } = await supabase.from('employees').select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
      return users; // Fall back to cached users
    }
    
    if (employees) {
      users = employees.map(mapEmployeeToUser);
    }
    
    return users;
  } catch (error) {
    console.error("Error in getUsers:", error);
    return users; // Fall back to cached users
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching user by ID:", error);
      // Fall back to local cache
      return users.find(user => user.id === id);
    }
    
    return employee ? mapEmployeeToUser(employee) : undefined;
  } catch (error) {
    console.error("Error in getUserById:", error);
    // Fall back to local cache
    return users.find(user => user.id === id);
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  try {
    const newEmployee = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      emp_id: user.employeeId,
      city: user.city,
      cluster: user.cluster,
      manager: user.manager,
      role: user.role,
      password: user.password,
      date_of_joining: user.dateOfJoining,
      date_of_birth: user.dateOfBirth,
      blood_group: user.bloodGroup,
      account_number: user.accountNumber,
      ifsc_code: user.ifscCode
    };
    
    // Don't specify id - let Supabase generate a UUID
    const { data: employee, error } = await supabase
      .from('employees')
      .insert(newEmployee)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user in Supabase:", error);
      throw error;
    }
    
    const newUser = mapEmployeeToUser(employee);
    // Update local cache
    users = [...users, newUser];
    
    return newUser;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | undefined> => {
  try {
    // Convert User type to employee table schema
    const employeeUpdate: any = {};
    
    if (userData.name) employeeUpdate.name = userData.name;
    if (userData.email) employeeUpdate.email = userData.email;
    if (userData.phone) employeeUpdate.phone = userData.phone;
    if (userData.employeeId) employeeUpdate.emp_id = userData.employeeId;
    if (userData.city) employeeUpdate.city = userData.city;
    if (userData.cluster) employeeUpdate.cluster = userData.cluster;
    if (userData.manager) employeeUpdate.manager = userData.manager;
    if (userData.role) employeeUpdate.role = userData.role;
    if (userData.password) employeeUpdate.password = userData.password;
    if (userData.dateOfJoining) employeeUpdate.date_of_joining = userData.dateOfJoining;
    if (userData.dateOfBirth) employeeUpdate.date_of_birth = userData.dateOfBirth;
    if (userData.bloodGroup) employeeUpdate.blood_group = userData.bloodGroup;
    if (userData.accountNumber) employeeUpdate.account_number = userData.accountNumber;
    if (userData.ifscCode) employeeUpdate.ifsc_code = userData.ifscCode;
    
    const { data: employee, error } = await supabase
      .from('employees')
      .update(employeeUpdate)
      .eq('id', String(id)) // Ensure ID is handled as string
      .select()
      .single();
    
    if (error) {
      console.error("Error updating user in Supabase:", error);
      
      // Fall back to in-memory update
      users = users.map(user => {
        if (user.id === id) {
          return { ...user, ...userData };
        }
        return user;
      });
      
      return users.find(user => user.id === id);
    }
    
    const updatedUser = mapEmployeeToUser(employee);
    
    // Update local cache
    users = users.map(user => {
      if (user.id === id) {
        return updatedUser;
      }
      return user;
    });
    
    return updatedUser;
  } catch (error) {
    console.error("Error in updateUser:", error);
    
    // Fall back to in-memory update
    users = users.map(user => {
      if (user.id === id) {
        return { ...user, ...userData };
      }
      return user;
    });
    
    return users.find(user => user.id === id);
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', String(id)); // Ensure ID is handled as string
    
    if (error) {
      console.error("Error deleting user from Supabase:", error);
      
      // Fall back to in-memory delete
      const initialLength = users.length;
      users = users.filter(user => user.id !== id);
      return users.length < initialLength;
    }
    
    // Update local cache
    users = users.filter(user => user.id !== id);
    return true;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    
    // Fall back to in-memory delete
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);
    return users.length < initialLength;
  }
};
