
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types';
import { createAuditLog } from './issueAuditService';
import { mapDbIssueToAppIssue } from './issueUtils';

export const mapIssueType = async (
  issueId: string,
  newTypeId: string,
  newSubTypeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    // Update the issue with the new type and subtype
    const { data, error } = await supabase
      .from('issues')
      .update({
        mapped_type_id: newTypeId,
        mapped_sub_type_id: newSubTypeId,
        mapped_at: new Date().toISOString(),
        mapped_by: currentUserId
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      console.error('Error mapping issue type:', error);
      return null;
    }

    // Create audit log for the mapping
    if (data) {
      await createAuditLog(
        issueId,
        currentUserId,
        'issue_mapped',
        { 
          newTypeId, 
          newSubTypeId,
          mappedAt: new Date().toISOString()
        },
        `Issue mapped to ${newTypeId}/${newSubTypeId}`
      );
    }

    // Convert database format to app format using the utility function
    return data ? mapDbIssueToAppIssue(data) : null;
  } catch (error) {
    console.error('Error in mapIssueType:', error);
    return null;
  }
};

export const isIssueMappable = (issue: Issue): boolean => {
  // Check if issue needs mapping (e.g., if it's categorized as "others" or has no type)
  return !issue.typeId || issue.typeId === 'others' || issue.typeId === 'UNKNOWN';
};

export const mapIssuePriority = (typeId: string, subTypeId: string): Issue['priority'] => {
  // Emergency cases
  if (typeId === 'IT_SUPPORT' && subTypeId === 'SYSTEM_DOWN') {
    return 'urgent';
  }
  
  if (typeId === 'PAYROLL' && subTypeId === 'SALARY_NOT_CREDITED') {
    return 'urgent';
  }

  // High priority cases
  if (typeId === 'LEAVE' && subTypeId === 'URGENT_LEAVE') {
    return 'high';
  }
  
  if (typeId === 'IT_SUPPORT' && (subTypeId === 'EMAIL_ISSUE' || subTypeId === 'VPN_ISSUE')) {
    return 'high';
  }

  // Medium priority cases
  if (typeId === 'PAYROLL' || typeId === 'BENEFITS') {
    return 'medium';
  }

  // Default to low priority
  return 'low';
};
