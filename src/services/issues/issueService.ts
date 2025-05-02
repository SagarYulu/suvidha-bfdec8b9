
import { Issue } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDbIssueToAppIssue, generateUUID } from "./issueUtils";
import { getCommentsForIssue } from "./issueCommentService";
import { logAuditTrail } from "./issueAuditService";

// Define filter types
export type IssueFilters = {
  city: string | null;
  cluster: string | null;
  issueType: string | null;
};

// Initialize service
const initializeService = () => {
  // migrateLocalStorageIssuesToDb(); - uncomment if needed
  console.log("Issue service initialized");
};
initializeService();

export const getIssues = async (filters?: IssueFilters): Promise<Issue[]> => {
  try {
    console.log("getIssues called with filters:", filters);
    
    // Get all employees first to apply city/cluster filters
    const { data: employees, error: employeeError } = await supabase
      .from('employees')
      .select('*');
      
    if (employeeError) {
      console.error('Error fetching employees for filtering:', employeeError);
      return [];
    }
    
    // Apply city and cluster filters to get matching user IDs
    let filteredEmployees = employees;
    if (filters?.city) {
      console.log("Filtering by city:", filters.city);
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.city && emp.city.toLowerCase() === filters.city?.toLowerCase()
      );
    }
    
    if (filters?.cluster) {
      console.log("Filtering by cluster:", filters.cluster);
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.cluster && emp.cluster.toLowerCase() === filters.cluster?.toLowerCase()
      );
    }
    
    console.log(`Found ${filteredEmployees.length} employees matching the city/cluster filters`);
    
    // Extract user IDs from filtered employees
    const userIds = filteredEmployees.map(emp => emp.user_id);
    
    // Start with the base query
    let query = supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply user_id filter if city or cluster filters are active
    if ((filters?.city || filters?.cluster) && userIds.length > 0) {
      console.log("Applying user_id filter with IDs:", userIds);
      query = query.in('user_id', userIds);
    } else if ((filters?.city || filters?.cluster) && userIds.length === 0) {
      console.log("No users match the city/cluster criteria, returning empty result");
      return []; // No users match, so no issues will match
    }
    
    // Filter by issue type
    if (filters?.issueType) {
      console.log("Filtering by issue type:", filters.issueType);
      query = query.eq('type_id', filters.issueType);
    }
    
    const { data: dbIssues, error } = await query;
    
    if (error) {
      console.error('Error fetching issues:', error);
      return [];
    }
    
    console.log(`Found ${dbIssues.length} issues matching the filters`);
    
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
            userId: comment.user_id,
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
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};

export const getIssuesByUserId = async (userId: string): Promise<Issue[]> => {
  try {
    // Get user issues from the database
    const { data: dbIssues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user issues:', error);
      return [];
    }
    
    // Get all comments for these issues
    const issueIds = dbIssues.map(issue => issue.id);
    
    if (issueIds.length === 0) {
      return [];
    }
    
    const { data: dbComments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .in('issue_id', issueIds)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Group comments by issue_id
    const commentsByIssueId: Record<string, any[]> = {};
    
    if (dbComments) {
      dbComments.forEach(comment => {
        const issueId = comment.issue_id;
        if (!commentsByIssueId[issueId]) {
          commentsByIssueId[issueId] = [];
        }
        
        commentsByIssueId[issueId].push({
          id: comment.id,
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at
        });
      });
    }
    
    // Map database issues to app Issue type with comments
    const issues = dbIssues.map(dbIssue => 
      mapDbIssueToAppIssue(dbIssue, commentsByIssueId[dbIssue.id] || [])
    );
    
    return issues;
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};

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

export const createIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Issue> => {
  try {
    // Generate a UUID for the new issue
    const newIssueId = generateUUID();
    
    // Insert issue into the database with the generated ID
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .insert({
        id: newIssueId,
        user_id: issue.userId,
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
      issue.userId,
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

export const updateIssueStatus = async (id: string, status: Issue['status']): Promise<Issue | undefined> => {
  try {
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
    
    // Log audit trail for status change
    await logAuditTrail(
      id,
      'system', // Ideally should be the currently logged-in user ID
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

// Re-export functions from other files to maintain the same API
export { getIssueTypeLabel, getIssueSubTypeLabel } from "./issueTypeHelpers";
export { addComment } from "./issueCommentService";
export { getAnalytics } from "./issueAnalyticsService";
