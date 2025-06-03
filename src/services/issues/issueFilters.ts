
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';
import { Issue } from "../../types";

export type IssueFilters = {
  city: string | null;
  cluster: string | null;
  issueType: string | null;
};

export const getIssues = async (filters?: IssueFilters): Promise<Issue[]> => {
  try {
    console.log("getIssues called with filters:", filters);
    
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.cluster) params.append('cluster', filters.cluster);
    if (filters?.issueType) params.append('issueType', filters.issueType);
    
    const response = await api.get(`${API_ENDPOINTS.ISSUES}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};
