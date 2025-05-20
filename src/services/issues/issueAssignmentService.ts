
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { createAuditLog } from "./issueAuditService";
import { getEmployeeNameByUuid } from "./issueUtils";

/**
 * Assign an issue to a user
 */
export const assignIssueToUser = async (
  issueId: string,
  assigneeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    console.log(`Assigning issue ${issueId} to user ${assigneeId} by ${currentUserId}`);
    
    // First, get the assignee name to include in the audit log
    const assigneeName = await getEmployeeNameByUuid(assigneeId);
    console.log(`Assigning to: ${assigneeName}`);
    
    const { data, error } = await supabase
      .from('issues')
      .update({
        assigned_to: assigneeId,
        updated_at: new Date().toISOString(),
        // If ticket was unassigned, set to in_progress automatically
        status: 'in_progress'
      })
      .eq('id', issueId)
      .select();
      
    if (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
    
    console.log('Assignment database update successful');
    
    // Create audit log entry for assignment
    await createAuditLog(
      issueId,
      currentUserId,
      'assignment',
      { 
        assigneeId,
        assigneeName, // Include name in the audit log
      },
      `Issue assigned to ${assigneeName}`
    );
    
    console.log('Assignment audit log created');
    
    // Return the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};
