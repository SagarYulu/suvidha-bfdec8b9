
import { supabase } from "@/integrations/supabase/client";
import { DashboardRole } from "./types";

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
