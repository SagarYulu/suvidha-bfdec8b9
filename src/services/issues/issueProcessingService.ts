
import { Issue } from "../../types";
import { api } from '../../lib/api';

const initializeService = () => {
  console.log("Issue processing service initialized");
};
initializeService();

export async function processIssues(dbIssues: any[]): Promise<Issue[]> {
  if (!dbIssues || dbIssues.length === 0) {
    return [];
  }
  
  // The API should return properly formatted issues
  return dbIssues;
}

export const formatConsistentIssueData = (issues: Issue[]): Issue[] => {
  return issues.map(issue => ({
    ...issue,
    status: issue.status,
    priority: issue.priority,
  }));
};
