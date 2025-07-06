
import { Issue } from "@/types";
import { ApiClient } from "../apiClient";

export interface IssueFilters {
  status?: string | null;
  priority?: string | null;
  assignedTo?: string | null;
  city?: string | null;
  cluster?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  issueType?: string | null;
}

export const getIssues = async (filters?: IssueFilters): Promise<Issue[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== null) {
          queryParams.append(key, value);
        }
      });
    }
    
    const response = await ApiClient.get(`/api/issues?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};
