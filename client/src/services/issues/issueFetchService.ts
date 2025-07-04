import { Issue } from "@/types";
import { mapDbIssueToAppIssue } from "./issueUtils";
import { processIssues } from "./issueProcessingService";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Fetches an issue by its ID
 */
export const getIssueById = async (id: string | number): Promise<Issue | undefined> => {
  try {
    // Get the issue from the database
    const response = await authenticatedAxios.get(`/api/issues/${id}`);
    const dbIssue = response.data;
    
    if (!dbIssue) {
      console.error('Issue not found');
      return undefined;
    }
    
    // Get comments for this issue
    let comments = [];
    try {
      const commentsResponse = await authenticatedAxios.get(`/api/issues/${id}/comments`);
      comments = commentsResponse.data || [];
    } catch (commentsError) {
      console.error('Error fetching comments:', commentsError);
      comments = [];
    }
    
    // Convert to app format and attach comments
    const issue = mapDbIssueToAppIssue(dbIssue, comments);
    
    return issue;
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return undefined;
  }
};

/**
 * Fetches all issues with optional filters
 */
export const getAllIssues = async (filters?: any): Promise<Issue[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/issues?${queryString}` : '/api/issues';
    
    const response = await authenticatedAxios.get(url);
    const dbIssues = response.data || [];
    
    // Convert and process issues
    const issues = dbIssues.map(mapDbIssueToAppIssue);
    return await processIssues(issues);
  } catch (error) {
    console.error('Error in getAllIssues:', error);
    return [];
  }
};

/**
 * Fetches issues assigned to a specific user
 */
export const getAssignedIssues = async (userId: string | number): Promise<Issue[]> => {
  try {
    const response = await authenticatedAxios.get(`/api/issues?assignedTo=${userId}`);
    const dbIssues = response.data || [];
    
    // Convert and process issues
    const issues = dbIssues.map(mapDbIssueToAppIssue);
    return await processIssues(issues);
  } catch (error) {
    console.error('Error in getAssignedIssues:', error);
    return [];
  }
};

/**
 * Fetches issues created by a specific user
 */
export const getIssuesByUserId = async (userId: string | number): Promise<Issue[]> => {
  try {
    const response = await authenticatedAxios.get(`/api/issues?employeeId=${userId}`);
    const dbIssues = response.data || [];
    
    // Convert and process issues
    const issues = dbIssues.map(mapDbIssueToAppIssue);
    return await processIssues(issues);
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};