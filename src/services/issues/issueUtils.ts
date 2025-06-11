
import { Issue } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const getEmployeeNameByUuid = async (employeeUuid: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('name')
      .eq('id', employeeUuid)
      .single();
      
    if (error) {
      console.error(`Error fetching employee name for UUID ${employeeUuid}:`, error.message);
      return 'Unknown Employee';
    }
    
    return data.name || 'Unknown Employee';
  } catch (error) {
    console.error(`Unexpected error fetching employee name for UUID ${employeeUuid}:`, error);
    return 'Unknown Employee';
  }
};

export const mapEmployeeUuidsToNames = async (issues: Issue[]): Promise<Record<string, string>> => {
  const uniqueUuids = [...new Set(issues.map(issue => issue.employeeUuid))];
  const names: Record<string, string> = {};
  
  for (const uuid of uniqueUuids) {
    names[uuid] = await getEmployeeNameByUuid(uuid);
  }
  
  return names;
};

export const getAvailableAssignees = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('dashboard_users')
      .select('id, name, role')
      .in('role', ['admin', 'manager', 'agent']);
      
    if (error) {
      console.error('Error fetching available assignees:', error);
      return [];
    }
    
    return data.map(user => ({
      value: user.id,
      label: `${user.name} (${user.role})`
    }));
  } catch (error) {
    console.error('Error fetching available assignees:', error);
    return [];
  }
};

export const mapDbIssueToAppIssue = (dbIssue: any): Issue => {
  return {
    id: dbIssue.id,
    employeeUuid: dbIssue.employee_uuid,
    typeId: dbIssue.type_id,
    subTypeId: dbIssue.sub_type_id,
    description: dbIssue.description,
    status: dbIssue.status as "open" | "in_progress" | "resolved" | "closed" | "pending",
    priority: dbIssue.priority as "low" | "medium" | "high" | "urgent",
    createdAt: dbIssue.created_at,
    updatedAt: dbIssue.updated_at,
    closedAt: dbIssue.closed_at,
    assignedTo: dbIssue.assigned_to,
    attachments: dbIssue.attachments || [],
    comments: [],
    title: dbIssue.title || 'Untitled Issue',
    issueType: dbIssue.issue_type || 'General',
    employeeId: dbIssue.employee_id || dbIssue.employee_uuid,
    mappedTypeId: dbIssue.mapped_type_id,
    mappedSubTypeId: dbIssue.mapped_sub_type_id,
    mappedAt: dbIssue.mapped_at,
    mappedBy: dbIssue.mapped_by
  };
};

export const formatIssueForDisplay = (issue: any): Issue => {
  return mapDbIssueToAppIssue(issue);
};
