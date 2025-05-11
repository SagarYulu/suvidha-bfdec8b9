
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { createAuditLog } from "./issueAuditService";

/**
 * Assign an issue to a user
 */
export const assignIssueToUser = async (
  issueId: string,
  assigneeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
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
    
    // Create audit log entry for assignment
    await createAuditLog(
      issueId,
      currentUserId,
      'assignment',
      { assigneeId },
      'Issue assigned to user'
    );
    
    // Return the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};
