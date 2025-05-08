
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export function generateUUID(): string {
  return uuidv4();
}

export function mapDbIssueToAppIssue(dbIssue: any, comments: any[] = []): any {
  return {
    id: dbIssue.id,
    employeeUuid: dbIssue.employee_uuid,
    typeId: dbIssue.type_id,
    subTypeId: dbIssue.sub_type_id,
    description: dbIssue.description,
    status: dbIssue.status,
    priority: dbIssue.priority,
    createdAt: dbIssue.created_at,
    updatedAt: dbIssue.updated_at,
    closedAt: dbIssue.closed_at,
    assignedTo: dbIssue.assigned_to,
    comments: comments || []
  };
}

export async function getEmployeeNameByUuid(employeeUuid: string): Promise<string> {
  try {
    if (!employeeUuid) {
      return "Unassigned";
    }

    // First try employees table
    let { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('id', employeeUuid)
      .single();

    if (employee?.name) {
      return employee.name;
    }

    // If not found in employees, try dashboard_users
    const { data: dashboardUser } = await supabase
      .from('dashboard_users')
      .select('name')
      .eq('id', employeeUuid)
      .single();

    if (dashboardUser?.name) {
      return dashboardUser.name;
    }

    // If still not found, return a fallback
    return "Unknown User";
  } catch (error) {
    console.error("Error fetching employee name:", error);
    return "Unknown User";
  }
}

export async function mapEmployeeUuidsToNames(employeeUuids: string[]): Promise<Record<string, string>> {
  if (!employeeUuids || employeeUuids.length === 0) {
    return {};
  }

  try {
    // Get unique user IDs
    const uniqueUuids = [...new Set(employeeUuids)];
    
    // Query employees table
    const { data: employees } = await supabase
      .from('employees')
      .select('id, name')
      .in('id', uniqueUuids);
    
    // Query dashboard_users table for any remaining IDs
    const foundEmployeeUuids = employees?.map(emp => emp.id) || [];
    const remainingUuids = uniqueUuids.filter(uuid => !foundEmployeeUuids.includes(uuid));
    
    let dashboardUsers = [];
    if (remainingUuids.length > 0) {
      const { data: users } = await supabase
        .from('dashboard_users')
        .select('id, name')
        .in('id', remainingUuids);
      
      dashboardUsers = users || [];
    }
    
    // Combine results into a single mapping object
    const nameMap: Record<string, string> = {};
    
    if (employees) {
      employees.forEach(emp => {
        nameMap[emp.id] = emp.name;
      });
    }
    
    if (dashboardUsers.length > 0) {
      dashboardUsers.forEach(user => {
        nameMap[user.id] = user.name;
      });
    }
    
    // Add admin/fallback entries used in the app
    if (uniqueUuids.includes('1')) nameMap['1'] = 'Admin';
    if (uniqueUuids.includes('admin-fallback')) nameMap['admin-fallback'] = 'Admin';
    if (uniqueUuids.includes('system')) nameMap['system'] = 'System';
    if (uniqueUuids.includes('system-fallback')) nameMap['system-fallback'] = 'System';
    
    return nameMap;
  } catch (error) {
    console.error("Error mapping employee UUIDs to names:", error);
    return {};
  }
}

// Updated function to get both managers from employees table and dashboard users as potential assignees
export async function getManagersList(): Promise<Array<{ id: string, name: string }>> {
  try {
    // First get all dashboard users that can be assignees
    const { data: dashboardUsers, error: adminError } = await supabase
      .from('dashboard_users')
      .select('id, name, role')
      .order('name');
      
    if (adminError) {
      console.error("Error fetching dashboard users:", adminError);
    }
    
    // Get managers from employees table
    const { data: managers, error: managerError } = await supabase
      .from('employees')
      .select('id, name')
      .not('manager', 'is', null)
      .neq('manager', '');
    
    if (managerError) {
      console.error("Error fetching managers:", managerError);
    }
    
    // Combine both lists
    const assignableUsers = [
      ...(dashboardUsers || []).map(user => ({ 
        id: user.id, 
        name: `${user.name} (${user.role})`
      })),
      ...(managers || []).map(manager => ({ 
        id: manager.id, 
        name: manager.name
      }))
    ];
    
    // Sort by name
    assignableUsers.sort((a, b) => a.name.localeCompare(b.name));
    
    return assignableUsers;
  } catch (error) {
    console.error("Error getting managers list:", error);
    return [];
  }
}
