
import { supabase } from "@/integrations/supabase/client";
import { DashboardUser, DashboardRole } from "@/services/dashboardRoleService";
import { CSVEmployeeData } from "@/types";

// Create a dashboard user with specific role
export const createDashboardUser = async (
  userData: {
    name: string;
    email: string;
    password: string;
    role: DashboardRole;
    city?: string;
    cluster?: string;
    manager?: string;
    phone?: string;
  }
): Promise<boolean> => {
  try {
    // Create the user in the dashboard_users table
    const { data, error } = await supabase
      .from('dashboard_users')
      .insert([
        {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          city: userData.city || null,
          cluster: userData.cluster || null,
          manager: userData.manager || null,
          phone: userData.phone || null,
          emp_id: `YS-${Math.floor(1000 + Math.random() * 9000)}`, // Generate a random employee ID
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating dashboard user:", error);
      return false;
    }
    
    // Log the action to audit trail
    await createAuditLog('dashboard_users', 'create', data.id, data);
    
    return true;
  } catch (error) {
    console.error("Error in createDashboardUser:", error);
    return false;
  }
};

// Create multiple dashboard users at once
export const createBulkDashboardUsers = async (
  usersData: Array<CSVEmployeeData>
): Promise<{success: boolean, count: number}> => {
  try {
    // Format user data for insertion
    const formattedUsers = usersData.map(user => ({
      name: user.name,
      email: user.email,
      password: user.password || 'changeme123',
      role: user.role,
      city: user.city || null,
      cluster: user.cluster || null,
      manager: user.manager || null,
      phone: user.phone || null,
      emp_id: user.emp_id || `YS-${Math.floor(1000 + Math.random() * 9000)}`, // Use provided or generate
    }));
    
    // Insert all users in a single operation
    const { data, error } = await supabase
      .from('dashboard_users')
      .insert(formattedUsers)
      .select();
      
    if (error) {
      console.error("Error creating bulk dashboard users:", error);
      return { success: false, count: 0 };
    }
    
    // Log the action to audit trail
    for (const user of data) {
      await createAuditLog('dashboard_users', 'create', user.id, user);
    }
    
    return { success: true, count: formattedUsers.length };
  } catch (error) {
    console.error("Error in createBulkDashboardUsers:", error);
    return { success: false, count: 0 };
  }
};

// Create audit log entry
const createAuditLog = async (
  entityType: string,
  action: string,
  entityId: string,
  changes: any
) => {
  try {
    const { error } = await supabase
      .from('dashboard_audit_logs')
      .insert({
        entity_type: entityType,
        action: action,
        entity_id: entityId,
        changes: changes,
        created_by: 'system' // This should be updated with actual user ID when available
      });
      
    if (error) {
      console.error("Error creating audit log:", error);
    }
  } catch (error) {
    console.error("Error in createAuditLog:", error);
  }
};

// Get all dashboard users
export const getDashboardUsers = async (): Promise<DashboardUser[]> => {
  try {
    const { data, error } = await supabase
      .from('dashboard_users')
      .select('*');
    
    if (error) {
      console.error("Error fetching dashboard users:", error);
      return [];
    }
    
    // Process and return the data
    return (data || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emp_id: user.emp_id,
      role: user.role as DashboardRole,
      phone: user.phone || "",
      city: user.city || "",
      cluster: user.cluster || "",
      manager: user.manager || ""
    })) as DashboardUser[];
  } catch (error) {
    console.error("Error in getDashboardUsers:", error);
    return [];
  }
};

// Assign a role to an existing user
export const assignDashboardRole = async (
  userId: string, 
  role: DashboardRole
): Promise<boolean> => {
  try {
    // Get the original user data for audit log
    const { data: originalUser } = await supabase
      .from('dashboard_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Update the user role
    const { data, error } = await supabase
      .from('dashboard_users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error("Error assigning dashboard role:", error);
      return false;
    }
    
    // Create audit log entry
    await createAuditLog('dashboard_users', 'update', userId, {
      before: { role: originalUser?.role },
      after: { role }
    });
    
    return true;
  } catch (error) {
    console.error("Error in assignDashboardRole:", error);
    return false;
  }
};
