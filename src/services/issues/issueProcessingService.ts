import { Issue } from '@/services/api/issueService';
import { getIssueTypeLabel, getIssueSubTypeLabel } from '@/services/issueService';
import { supabase } from "@/integrations/supabase/client";
import { mapDbIssueToAppIssue } from "./issueUtils";

// Initialize service
const initializeService = () => {
  console.log("Issue processing service initialized");
};
initializeService();

/**
 * Processes a list of database issues and adds their comments
 * Ensures consistent formatting across application
 */
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
  
  // Map database issues to app Issue type with comments and ensure consistent formatting
  const issues = dbIssues.map(dbIssue => {
    const issue = mapDbIssueToAppIssue(dbIssue, commentsByIssueId[dbIssue.id] || []);
    
    // Ensure priority is formatted consistently
    // For closed or resolved issues, we'll still keep the original priority in the data
    // but the UI can choose to display it differently
    
    return issue;
  });
  
  return issues;
}

export const formatConsistentIssueData = (issues: Issue[]): Issue[] => {
  return issues.map(issue => ({
    ...issue,
    // Ensure all required fields are present
    id: issue.id,
    employeeUuid: issue.employeeUuid,
    typeId: issue.typeId,
    subTypeId: issue.subTypeId || '',
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    closedAt: issue.closedAt || null,
    assignedTo: issue.assignedTo || null,
    escalation_level: issue.escalation_level || 0,
    escalated_at: issue.escalated_at || null,
    cluster: issue.cluster || '',
    city: issue.city || '',
    comments: issue.comments || [],
  }));
};

export const addComputedFields = (issues: Issue[]) => {
  return issues.map(issue => ({
    ...issue,
    typeLabel: getIssueTypeLabel(issue.typeId),
    subTypeLabel: getIssueSubTypeLabel(issue.typeId, issue.subTypeId),
    daysOld: Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  }));
};

export const processIssuesForDisplay = (issues: Issue[]) => {
  const formatted = formatConsistentIssueData(issues);
  return addComputedFields(formatted);
};
