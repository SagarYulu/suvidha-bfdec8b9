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

export const formatIssueForDisplay = (issue: any): Issue => {
  return {
    id: issue.id,
    employeeUuid: issue.employee_uuid,
    typeId: issue.type_id,
    subTypeId: issue.sub_type_id,
    description: issue.description,
    status: issue.status as "open" | "in_progress" | "resolved" | "closed",
    priority: issue.priority as "low" | "medium" | "high" | "urgent",
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    assignedTo: issue.assigned_to,
    attachmentUrl: issue.attachment_url,
    attachments: issue.attachments,
    comments: [], // Comments will be populated separately
    title: issue.title || 'Untitled Issue',
    issueType: issue.issue_type || 'General',
    employeeId: issue.employee_id || issue.employeeUuid,
    // Add mapped fields
    mappedTypeId: issue.mapped_type_id,
    mappedSubTypeId: issue.mapped_sub_type_id,
    mappedAt: issue.mapped_at,
    mappedBy: issue.mapped_by
  };
};
