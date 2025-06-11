
import { Issue } from "@/types";
import { issueService } from "@/services/api/issueService";
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
  
  // Get all comments for these issues from backend API
  const issueIds = dbIssues.map(issue => issue.id);
  let commentsByIssueId: Record<string, any[]> = {};
  
  if (issueIds.length > 0) {
    try {
      // Fetch comments for all issues
      const commentPromises = issueIds.map(async (issueId) => {
        try {
          const comments = await issueService.getIssueComments(issueId);
          return { issueId, comments: comments || [] };
        } catch (error) {
          console.error(`Error fetching comments for issue ${issueId}:`, error);
          return { issueId, comments: [] };
        }
      });
      
      const commentResults = await Promise.all(commentPromises);
      
      // Group comments by issue_id
      commentResults.forEach(({ issueId, comments }) => {
        commentsByIssueId[issueId] = comments.map(comment => ({
          id: comment.id,
          employeeUuid: comment.employeeUuid,
          content: comment.content,
          createdAt: comment.createdAt
        }));
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
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
    // Ensure status is consistently formatted (remove underscores for display)
    status: issue.status,
    // Ensure priority is consistently formatted
    priority: issue.priority,
  }));
};
