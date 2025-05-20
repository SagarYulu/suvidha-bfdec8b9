
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { createAuditLog } from "./issueAuditService";
import { getEmployeeNameByUuid } from "./issueUtils";

/**
 * Update the status of an issue
 */
export const updateIssueStatus = async (
  issueId: string,
  newStatus: Issue["status"],
  userId: string
): Promise<Issue | null> => {
  try {
    console.log(`Updating issue status. Issue ID: ${issueId}, New Status: ${newStatus}, Provided UserID: ${userId}`);
    
    // Get current issue to track status change
    const currentIssue = await getIssueById(issueId);
    const previousStatus = currentIssue?.status;
    
    // Get resolver name for audit log
    const resolverName = await getEmployeeNameByUuid(userId);
    console.log(`Resolver name: ${resolverName}`);
    
    // Prepare update data without the last_status_change_at field
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    
    // If status is closed or resolved, add closed_at
    if (newStatus === 'closed' || newStatus === 'resolved') {
      updateData.closed_at = new Date().toISOString();
    } else {
      // If reopening, remove closed_at
      updateData.closed_at = null;
    }
    
    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select();
      
    if (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
    
    // Create audit log entry with resolver info
    await createAuditLog(
      issueId,
      userId,
      'status_change',
      { 
        previousStatus, 
        newStatus,
        resolverName // Include resolver name
      },
      `Issue status updated from ${previousStatus} to ${newStatus} by ${resolverName}`
    );
    
    // Get the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};
