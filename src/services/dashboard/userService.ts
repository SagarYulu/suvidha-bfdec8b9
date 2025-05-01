
import { supabase } from "@/integrations/supabase/client";
import { DashboardRole, DashboardUser } from "./types";

// Get all dashboard users
export const getDashboardUsers = async (): Promise<DashboardUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .in('role', [DashboardRole.ADMIN, DashboardRole.OPS_HEAD, DashboardRole.SECURITY_MANAGER]);
    
    if (error) {
      console.error("Error fetching dashboard users:", error);
      return [];
    }
    
    // Cast the role from string to DashboardRole before returning
    return (data || []).map(user => ({
      ...user,
      role: user.role as DashboardRole
    })) as DashboardUser[];
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
