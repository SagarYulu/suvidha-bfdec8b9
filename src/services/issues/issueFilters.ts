
import { issueService, Issue, IssueFilters } from '@/services/api/issueService';

// Re-export types for compatibility
export type { Issue, IssueFilters };

// Main function to get issues with filters - now uses backend API
export const getIssues = async (filters: IssueFilters = {}): Promise<Issue[]> => {
  try {
    return await issueService.getIssues(filters);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
};

// Get single issue
export const getIssue = async (id: string): Promise<Issue | null> => {
  try {
    return await issueService.getIssue(id);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return null;
  }
};

// Create new issue
export const createIssue = async (issueData: any): Promise<Issue | null> => {
  try {
    return await issueService.createIssue(issueData);
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};

// Update issue status
export const updateIssueStatus = async (id: string, status: string): Promise<Issue | null> => {
  try {
    return await issueService.updateIssueStatus(id, status);
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};

// Assign issue
export const assignIssue = async (id: string, assignedTo: string): Promise<Issue | null> => {
  try {
    return await issueService.assignIssue(id, assignedTo);
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};

// Get assigned issues
export const getAssignedIssues = async (userId: string): Promise<Issue[]> => {
  try {
    return await issueService.getAssignedIssues(userId);
  } catch (error) {
    console.error('Error fetching assigned issues:', error);
    return [];
  }
};

// Get employee issues  
export const getEmployeeIssues = async (employeeId: string): Promise<Issue[]> => {
  try {
    return await issueService.getEmployeeIssues(employeeId);
  } catch (error) {
    console.error('Error fetching employee issues:', error);
    return [];
  }
};
