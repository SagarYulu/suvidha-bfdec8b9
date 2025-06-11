
import { Issue } from "@/types";
import { issueService } from "@/services/api/issueService";
import { processIssues } from "./issueCore";

// Define filter types
export type IssueFilters = {
  city: string | null;
  cluster: string | null;
  issueType: string | null;
};

/**
 * Gets issues based on specified filters using backend API
 * 
 * @param filters Optional filters for city, cluster, and issue type
 * @returns Processed list of issues
 */
export const getIssues = async (filters?: IssueFilters): Promise<Issue[]> => {
  try {
    console.log("getIssues called with filters:", filters);
    
    // Convert frontend filters to backend API format
    const apiFilters: any = {};
    
    if (filters?.city) {
      apiFilters.city = filters.city;
    }
    
    if (filters?.cluster) {
      apiFilters.cluster = filters.cluster;
    }
    
    if (filters?.issueType) {
      apiFilters.issueType = filters.issueType;
    }
    
    console.log("Calling backend API with filters:", apiFilters);
    
    // Get issues from backend API
    const issues = await issueService.getIssues(apiFilters);
    
    console.log(`Found ${issues?.length || 0} issues from backend`);
    
    // Process and return issues
    return await processIssues(issues || []);
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};
