
import { supabase } from "@/integrations/supabase/client";

// Define all the dashboard roles
export enum DashboardRole {
  ADMIN = "admin",
  OPS_HEAD = "ops_head",
  SECURITY_MANAGER = "security_manager"
}

// Define permissions per page for each role
export interface RolePermissions {
  view: boolean;
  edit: boolean;
}

// Define the pages that can have permissions
export type DashboardPage = 
  "dashboard" | 
  "tickets" | 
  "users" | 
  "analytics" | 
  "access_control" | 
  "settings" | 
  "security_management" |
  "dashboard_users";

// Define the permissions matrix
const rolePermissionsMatrix: Record<DashboardRole, Record<DashboardPage, RolePermissions>> = {
  [DashboardRole.ADMIN]: {
    dashboard: { view: true, edit: true },
    tickets: { view: true, edit: true },
    users: { view: true, edit: true },
    analytics: { view: true, edit: true },
    access_control: { view: true, edit: true },
    settings: { view: true, edit: true },
    security_management: { view: true, edit: true },
    dashboard_users: { view: true, edit: true }
  },
  [DashboardRole.OPS_HEAD]: {
    dashboard: { view: true, edit: false },
    tickets: { view: true, edit: false },
    users: { view: false, edit: false },
    analytics: { view: true, edit: false },
    access_control: { view: false, edit: false },
    settings: { view: false, edit: false },
    security_management: { view: false, edit: false },
    dashboard_users: { view: false, edit: false }
  },
  [DashboardRole.SECURITY_MANAGER]: {
    dashboard: { view: false, edit: false },
    tickets: { view: false, edit: false },
    users: { view: false, edit: false },
    analytics: { view: false, edit: false },
    access_control: { view: true, edit: true },
    settings: { view: false, edit: false },
    security_management: { view: true, edit: true },
    dashboard_users: { view: true, edit: true }
  }
};

// Check if a user has permission for a specific action on a page
export const hasPermission = (
  role: DashboardRole | string | null, 
  page: DashboardPage, 
  action: "view" | "edit"
): boolean => {
  // If no role or invalid role, deny access
  if (!role || !(role in rolePermissionsMatrix)) {
    return false;
  }
  
  // Cast role to DashboardRole type
  const userRole = role as DashboardRole;
  
  // Check if the page exists in permissions matrix
  if (!(page in rolePermissionsMatrix[userRole])) {
    return false;
  }
  
  // Return permission for the specific action
  return rolePermissionsMatrix[userRole][page][action];
};

// Get all dashboard users
export const getDashboardUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .in('role', [DashboardRole.ADMIN, DashboardRole.OPS_HEAD, DashboardRole.SECURITY_MANAGER]);
    
    if (error) {
      console.error("Error fetching dashboard users:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getDashboardUsers:", error);
    return [];
  }
};

// Create a dashboard user with specific role
export const createDashboardUser = async (
  userData: {
    name: string;
    email: string;
    password: string;
    role: DashboardRole;
  }
): Promise<boolean> => {
  try {
    // Create the user in the employees table
    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          emp_id: `YS-${Math.floor(1000 + Math.random() * 9000)}`, // Generate a random employee ID
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating dashboard user:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in createDashboardUser:", error);
    return false;
  }
};

// Create multiple dashboard users at once
export const createBulkDashboardUsers = async (
  usersData: Array<{
    name: string;
    email: string;
    password?: string;
    role: DashboardRole;
  }>
): Promise<{success: boolean, count: number}> => {
  try {
    // Format user data for insertion
    const formattedUsers = usersData.map(user => ({
      name: user.name,
      email: user.email,
      password: user.password || 'changeme123',
      role: user.role,
      emp_id: `YS-${Math.floor(1000 + Math.random() * 9000)}`, // Generate a random employee ID
    }));
    
    // Insert all users in a single operation
    const { data, error } = await supabase
      .from('employees')
      .insert(formattedUsers);
      
    if (error) {
      console.error("Error creating bulk dashboard users:", error);
      return { success: false, count: 0 };
    }
    
    return { success: true, count: formattedUsers.length };
  } catch (error) {
    console.error("Error in createBulkDashboardUsers:", error);
    return { success: false, count: 0 };
  }
};

// Assign a role to an existing user
export const assignDashboardRole = async (
  userId: string, 
  role: DashboardRole
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error("Error assigning dashboard role:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignDashboardRole:", error);
    return false;
  }
};
