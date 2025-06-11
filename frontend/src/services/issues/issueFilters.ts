
import { apiCall } from '@/config/api';

export interface IssueFilters {
  city?: string | null;
  cluster?: string | null;
  issueType?: string | null;
  status?: string | null;
  priority?: string | null;
  assignedTo?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export const getIssues = async (filters?: IssueFilters) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching issues from:', endpoint);
    
    const response = await apiCall(endpoint);
    return response.data || response || [];
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};

export const getIssueById = async (id: string) => {
  try {
    const response = await apiCall(`/issues/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching issue by ID:', error);
    throw error;
  }
};

export const updateIssueStatus = async (id: string, status: string, comment?: string) => {
  try {
    const response = await apiCall(`/issues/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};

export const assignIssue = async (id: string, assignedTo: string) => {
  try {
    const response = await apiCall(`/issues/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo }),
    });
    return response.data || response;
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};
