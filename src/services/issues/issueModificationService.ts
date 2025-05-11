import { Issue } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDbIssueToAppIssue, generateUUID } from "./issueUtils";
import { logAuditTrail } from "./issueAuditService";
import { getIssueById } from "./issueFetchService";
import { determinePriority, calculateReopenableUntil } from "@/utils/workingTimeUtils";

/**
 * Creates a new issue
 */
export const createIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Issue> => {
  try {
    // Generate a UUID for the new issue
    const newIssueId = generateUUID();
    
    // Set the priority based on the dynamic priority system
    const now = new Date().toISOString();
    const initialPriority = determinePriority(
      now, 
      now, 
      issue.status, 
      issue.typeId, 
      issue.assignedTo
    );
    
    // Insert issue into the database with the generated ID
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .insert({
        id: newIssueId,
        employee_uuid: issue.employeeUuid,
        type_id: issue.typeId,
        sub_type_id: issue.subTypeId,
        description: issue.description,
        status: issue.status,
        priority: initialPriority,
        assigned_to: issue.assignedTo
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
    
    // Log audit trail
    await logAuditTrail(
      dbIssue.id,
      issue.employeeUuid,
      'issue_created',
      undefined,
      dbIssue.status,
      { issue_type: issue.typeId, priority: initialPriority }
    );
    
    // Return the created issue in app Issue format
    return mapDbIssueToAppIssue(dbIssue, []);
  } catch (error) {
    console.error('Error in createIssue:', error);
    throw error;
  }
};

/**
 * Updates an issue's status
 */
export const updateIssueStatus = async (id: string, status: Issue['status'], userId?: string): Promise<Issue | undefined> => {
  try {
    console.log(`Updating issue status. Issue ID: ${id}, New Status: ${status}, Provided UserID: ${userId || 'not provided'}`);
    
    if (!id) {
      console.error('Error: Issue ID is required for status update');
      return undefined;
    }
    
    // First get the current issue to capture previous status
    const { data: currentIssue, error: fetchError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current issue:', fetchError);
      return undefined;
    }
    
    const previousStatus = currentIssue.status;
    const now = new Date().toISOString();
    const updateData: any = {
      status,
      updated_at: now,
      last_status_change_at: now
    };
    
    // If status is 'closed' or 'resolved', update the closed_at timestamp
    // and calculate the reopenable_until timestamp
    if (status === 'closed' || status === 'resolved') {
      updateData.closed_at = now;
      updateData.reopenable_until = calculateReopenableUntil(now);
      
      // Store previous closure timestamps if this is not the first time being closed
      if (currentIssue.previously_closed_at) {
        // Type assertion to handle previously_closed_at as any
        const prevClosedAt = currentIssue.previously_closed_at as string[];
        updateData.previously_closed_at = [...prevClosedAt, now];
      } else {
        updateData.previously_closed_at = [now];
      }
    }
    
    // If reopening a ticket (changing from closed/resolved to open)
    if ((previousStatus === 'closed' || previousStatus === 'resolved') && 
        (status === 'open' || status === 'in_progress')) {
      updateData.closed_at = null;
      updateData.reopenable_until = null;
    }
    
    // Calculate the new priority when status changes, only for active tickets
    const fullIssue: Issue = mapDbIssueToAppIssue(currentIssue, []);
    fullIssue.status = status; // Update with the new status
    
    const newPriority = determinePriority(
      fullIssue.createdAt,
      now,
      status,
      fullIssue.typeId,
      fullIssue.assignedTo
    );
    
    // Add priority to update data
    updateData.priority = newPriority;
    
    // Update the issue in the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating issue status:', error);
      return undefined;
    }
    
    // Determine the correct user identifier for the audit log
    let validUserIdentifier: string;
    
    // Check if the provided userId needs verification
    if (!userId || 
        userId === 'system' || 
        userId === 'admin-fallback' || 
        userId === 'security-user-1') {
      
      console.log('Provided user ID needs verification:', userId);
      
      // Get current authenticated user directly from session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session?.user?.id) {
        validUserIdentifier = session.user.id;
        console.log('Found authenticated user in session:', validUserIdentifier);
      } else {
        console.warn('No authenticated user found in session, using fallback');
        validUserIdentifier = userId || 'system-fallback';
      }
    } else {
      // The provided userId appears valid
      validUserIdentifier = userId;
    }
    
    console.log('Final user identifier for audit trail:', validUserIdentifier);
    
    // Add additional audit details for reopening
    const auditDetails: any = { timestamp: now, priority: newPriority };
    
    if ((previousStatus === 'closed' || previousStatus === 'resolved') && 
        (status === 'open' || status === 'in_progress')) {
      auditDetails.reopened = true;
      auditDetails.previously_closed_at = currentIssue.closed_at;
    }
    
    // Log audit trail for status change with the validated user ID
    await logAuditTrail(
      id,
      validUserIdentifier, 
      'status_changed',
      previousStatus,
      status,
      auditDetails
    );
    
    // Get the updated issue with comments
    return await getIssueById(id);
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
    return undefined;
  }
};

/**
 * Reopens a closed or resolved ticket
 */
export const reopenTicket = async (id: string, reopenReason: string, userId: string): Promise<Issue | undefined> => {
  try {
    // Get the current issue to check if it can be reopened
    const issue = await getIssueById(id);
    
    if (!issue) {
      console.error('Issue not found');
      return undefined;
    }
    
    // Check if the ticket is closed or resolved
    if (issue.status !== 'closed' && issue.status !== 'resolved') {
      console.error('Only closed or resolved tickets can be reopened');
      return undefined;
    }
    
    // Check if the ticket is still within the reopenable time window
    const now = new Date();
    const reopenableUntil = issue.reopenableUntil ? new Date(issue.reopenableUntil) : null;
    
    if (!reopenableUntil || now > reopenableUntil) {
      console.error('Ticket reopening window has expired');
      return undefined;
    }
    
    // Reopen the ticket by setting status to open
    const reopenedIssue = await updateIssueStatus(id, 'open', userId);
    
    if (reopenedIssue) {
      // Add a comment indicating the ticket was reopened
      const { data, error } = await supabase
        .from('issue_comments')
        .insert({
          issue_id: id,
          employee_uuid: userId,
          content: `Ticket reopened. Reason: ${reopenReason}`
        })
        .select();
        
      if (error) {
        console.error('Error adding reopen comment:', error);
      }
    }
    
    return reopenedIssue;
  } catch (error) {
    console.error('Error reopening ticket:', error);
    return undefined;
  }
};

/**
 * Assigns an issue to a user
 */
export const assignIssueToUser = async (issueId: string, assignedToUuid: string, assignerUuid: string): Promise<Issue | null> => {
  try {
    console.log(`Assigning issue ${issueId} to user ${assignedToUuid} by ${assignerUuid}`);
    
    // Get current issue data
    const currentIssue = await getIssueById(issueId);
    if (!currentIssue) {
      console.error('Issue not found');
      return null;
    }
    
    // Calculate new priority based on assignment
    const now = new Date().toISOString();
    const newPriority = determinePriority(
      currentIssue.createdAt,
      now,
      currentIssue.status,
      currentIssue.typeId,
      assignedToUuid // Include the new assignee
    );
    
    // Update the issue with assigned_to value and new priority
    const { data, error } = await supabase
      .from('issues')
      .update({ 
        assigned_to: assignedToUuid,
        priority: newPriority,
        updated_at: now
      })
      .eq('id', issueId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
    
    // Add an audit trail entry for the assignment
    await supabase
      .from('issue_audit_trail')
      .insert({
        issue_id: issueId,
        employee_uuid: assignerUuid,
        action: 'assign_ticket',
        details: {
          assigned_to: assignedToUuid,
          assigned_by: assignerUuid,
          new_priority: newPriority
        }
      });
    
    // Add the comments and fetch the updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error in assignIssueToUser:', error);
    return null;
  }
};
