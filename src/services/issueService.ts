
import { Issue, IssueComment } from "@/types";
import { MOCK_ISSUES } from "@/data/mockData";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "@/services/userService";

// In-memory storage for the mock issues
// Use localStorage to persist the issues between page refreshes
const getStoredIssues = (): Issue[] => {
  const storedIssues = localStorage.getItem('issues');
  return storedIssues ? JSON.parse(storedIssues) : [...MOCK_ISSUES];
};

// Initialize issues from localStorage or fallback to MOCK_ISSUES
let issues = getStoredIssues();

// Helper function to persist issues to localStorage
const persistIssues = (updatedIssues: Issue[]) => {
  localStorage.setItem('issues', JSON.stringify(updatedIssues));
  issues = updatedIssues;
};

export const getIssues = (): Promise<Issue[]> => {
  return Promise.resolve(issues);
};

export const getIssuesByUserId = (userId: string): Promise<Issue[]> => {
  const userIssues = issues.filter(issue => issue.userId === userId);
  return Promise.resolve(userIssues);
};

export const getIssueById = (id: string): Promise<Issue | undefined> => {
  const issue = issues.find(issue => issue.id === id);
  return Promise.resolve(issue);
};

export const createIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Issue> => {
  const now = new Date().toISOString();
  const newIssue: Issue = {
    id: `${issues.length + 1}`,
    ...issue,
    createdAt: now,
    updatedAt: now,
    comments: [],
  };
  
  const updatedIssues = [...issues, newIssue];
  persistIssues(updatedIssues);
  
  return Promise.resolve(newIssue);
};

export const updateIssueStatus = (id: string, status: Issue['status']): Promise<Issue | undefined> => {
  const now = new Date().toISOString();
  
  const updatedIssues = issues.map(issue => {
    if (issue.id === id) {
      return {
        ...issue,
        status,
        updatedAt: now,
        closedAt: status === "closed" ? now : issue.closedAt,
      };
    }
    return issue;
  });
  
  persistIssues(updatedIssues);
  
  return getIssueById(id);
};

export const addComment = (issueId: string, comment: Omit<IssueComment, 'id' | 'createdAt'>): Promise<Issue | undefined> => {
  const now = new Date().toISOString();
  const newComment: IssueComment = {
    id: `comment-${Date.now()}`,
    ...comment,
    createdAt: now,
  };
  
  // Log the comment being added for debugging purposes
  console.log(`Adding comment to issue ${issueId}:`, newComment);
  
  const updatedIssues = issues.map(issue => {
    if (issue.id === issueId) {
      const updatedIssue = {
        ...issue,
        comments: [...issue.comments, newComment],
        updatedAt: now,
      };
      console.log(`Updated issue with comments:`, updatedIssue.comments);
      return updatedIssue;
    }
    return issue;
  });
  
  // Persist the updated issues to localStorage
  persistIssues(updatedIssues);
  
  // Log all issues after the update for debugging
  console.log(`All issues after comment addition:`, 
    issues.map(i => ({ id: i.id, commentCount: i.comments.length }))
  );
  
  return getIssueById(issueId);
};

export const getIssueTypeLabel = (typeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  return issueType?.label || typeId;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  const subType = issueType?.subTypes.find(subType => subType.id === subTypeId);
  return subType?.label || subTypeId;
};

export const getAnalytics = async () => {
  // Calculate various analytics based on the issues data
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "closed" || i.status === "resolved").length;
  const openIssues = totalIssues - resolvedIssues;
  
  // Average resolution time (for closed issues)
  const closedIssues = issues.filter(i => i.closedAt);
  let avgResolutionTime = 0;
  
  if (closedIssues.length > 0) {
    const totalResolutionTime = closedIssues.reduce((total, issue) => {
      const createdDate = new Date(issue.createdAt);
      const closedDate = new Date(issue.closedAt!);
      const timeDiff = closedDate.getTime() - createdDate.getTime();
      return total + timeDiff;
    }, 0);
    
    avgResolutionTime = totalResolutionTime / closedIssues.length / (1000 * 60 * 60); // hours
  }
  
  // Fetch user data to correctly map manager information
  const users = await getUsers();
  
  // City-wise issues
  const cityCounts: Record<string, number> = {};
  // Cluster-wise issues
  const clusterCounts: Record<string, number> = {};
  // Manager-wise issues - fixed to use real user data
  const managerCounts: Record<string, number> = {};
  // Issue type distribution
  const typeCounts: Record<string, number> = {};
  
  // Process each issue and map it to the correct user data
  issues.forEach(issue => {
    // Find the user who created this issue
    const user = users.find(u => u.id === issue.userId);
    
    if (user) {
      // Use actual user data for analytics
      const city = user.city || "Unknown";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
      
      const cluster = user.cluster || "Unknown";
      clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
      
      // Use the actual manager name from user data
      const manager = user.manager || "Unassigned";
      managerCounts[manager] = (managerCounts[manager] || 0) + 1;
    } else {
      // Fallback for issues without valid user data
      cityCounts["Unknown"] = (cityCounts["Unknown"] || 0) + 1;
      clusterCounts["Unknown"] = (clusterCounts["Unknown"] || 0) + 1;
      managerCounts["Unassigned"] = (managerCounts["Unassigned"] || 0) + 1;
    }
    
    // Real issue type data
    typeCounts[issue.typeId] = (typeCounts[issue.typeId] || 0) + 1;
  });
  
  // Log analytics data for debugging
  console.log("Analytics data - Manager counts:", managerCounts);
  
  return {
    totalIssues,
    resolvedIssues,
    openIssues,
    resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
    avgResolutionTime: avgResolutionTime.toFixed(2),
    cityCounts,
    clusterCounts,
    managerCounts,
    typeCounts,
  };
};
