
import { Issue } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDbIssueToAppIssue, generateUUID } from "./issueUtils";
import { getCommentsForIssue } from "./issueCommentService";
import { logAuditTrail } from "./issueAuditService";

// Initialize service - existing code...
const initializeService = () => {
  console.log("Issue core service initialized");
};
initializeService();

// Helper function to process issues with their comments - existing code...
export async function processIssues(dbIssues: any[]): Promise<Issue[]> {
  // If no issues found, return empty array
  if (!dbIssues || dbIssues.length === 0) {
    return [];
  }
  
  // Get all comments for these issues
  const issueIds = dbIssues.map(issue => issue.id);
  let commentsByIssueId: Record<string, any[]> = {};
  
  if (issueIds.length > 0) {
    const { data: dbComments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .in('issue_id', issueIds)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Group comments by issue_id
    if (dbComments) {
      dbComments.forEach(comment => {
        const issueId = comment.issue_id;
        if (!commentsByIssueId[issueId]) {
          commentsByIssueId[issueId] = [];
        }
        
        commentsByIssueId[issueId].push({
          id: comment.id,
          employeeUuid: comment.employee_uuid,
          content: comment.content,
          createdAt: comment.created_at
        });
      });
    }
  }
  
  // Map database issues to app Issue type with comments
  const issues = dbIssues.map(dbIssue => 
    mapDbIssueToAppIssue(dbIssue, commentsByIssueId[dbIssue.id] || [])
  );
  
  return issues;
}

export const getIssueById = async (id: string): Promise<Issue | undefined> => {
  try {
    // Get the issue from the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching issue by ID:', error);
      return undefined;
    }
    
    // Get comments for this issue
    const comments = await getCommentsForIssue(id);
    
    // Map database issue to app Issue type
    return mapDbIssueToAppIssue(dbIssue, comments);
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return undefined;
  }
};

export const getIssuesByUserId = async (employeeUuid: string): Promise<Issue[]> => {
  try {
    // Get user issues from the database
    const { data: dbIssues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('employee_uuid', employeeUuid)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user issues:', error);
      return [];
    }
    
    // Process issues with comments and return
    return await processIssues(dbIssues);
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};

export const createIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Issue> => {
  try {
    // Generate a UUID for the new issue
    const newIssueId = generateUUID();
    
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
        priority: issue.priority,
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
      { issue_type: issue.typeId, priority: issue.priority }
    );
    
    // Return the created issue in app Issue format
    return mapDbIssueToAppIssue(dbIssue, []);
  } catch (error) {
    console.error('Error in createIssue:', error);
    throw error;
  }
};

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
      updated_at: now
    };
    
    // If status is 'closed', update the closed_at timestamp
    if (status === 'closed') {
      updateData.closed_at = now;
    }
    
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
    
    // Log audit trail for status change with the validated user ID
    await logAuditTrail(
      id,
      validUserIdentifier, 
      'status_changed',
      previousStatus,
      status,
      { timestamp: now }
    );
    
    // Get comments for this issue to return complete issue
    const comments = await getCommentsForIssue(id);
    
    // Map database issue to app Issue type and include comments
    return mapDbIssueToAppIssue(dbIssue, comments);
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
    return undefined;
  }
};

// New function to assign issue to a user
export const assignIssueToUser = async (issueId: string, assigneeId: string, currentUserId?: string): Promise<Issue | undefined> => {
  try {
    console.log(`Assigning issue. Issue ID: ${issueId}, Assignee ID: ${assigneeId}, Current User ID: ${currentUserId || 'not provided'}`);
    
    if (!issueId) {
      console.error('Error: Issue ID is required for assignment');
      return undefined;
    }
    
    // First get the current issue to capture previous assignment
    const { data: currentIssue, error: fetchError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current issue:', fetchError);
      return undefined;
    }
    
    const previousAssignment = currentIssue.assigned_to;
    const now = new Date().toISOString();
    
    // Update the issue in the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .update({
        assigned_to: assigneeId,
        updated_at: now
      })
      .eq('id', issueId)
      .select()
      .single();
    
    if (error) {
      console.error('Error assigning issue:', error);
      return undefined;
    }
    
    // Determine the correct user identifier for the audit log
    let validUserIdentifier: string;
    
    // Check if the provided userId needs verification
    if (!currentUserId || 
        currentUserId === 'system' || 
        currentUserId === 'admin-fallback' || 
        currentUserId === 'security-user-1') {
      
      console.log('Provided user ID needs verification:', currentUserId);
      
      // Get current authenticated user directly from session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session?.user?.id) {
        validUserIdentifier = session.user.id;
        console.log('Found authenticated user in session:', validUserIdentifier);
      } else {
        console.warn('No authenticated user found in session, using fallback');
        validUserIdentifier = currentUserId || 'system-fallback';
      }
    } else {
      // The provided userId appears valid
      validUserIdentifier = currentUserId;
    }
    
    // Log audit trail for assignment change
    await logAuditTrail(
      issueId,
      validUserIdentifier, 
      'assignment_changed',
      previousAssignment,
      assigneeId,
      { 
        timestamp: now,
        previous_assignee: previousAssignment || 'Unassigned',
        new_assignee: assigneeId
      }
    );
    
    // Get comments for this issue to return complete issue
    const comments = await getCommentsForIssue(issueId);
    
    // Map database issue to app Issue type and include comments
    return mapDbIssueToAppIssue(dbIssue, comments);
  } catch (error) {
    console.error('Error in assignIssueToUser:', error);
    return undefined;
  }
};
