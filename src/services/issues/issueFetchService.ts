
import { Issue } from "../../types";
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';

export const getIssueById = async (id: string): Promise<Issue | undefined> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ISSUES}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return undefined;
  }
};

export const getIssuesByUserId = async (employeeUuid: string): Promise<Issue[]> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ISSUES}?employeeUuid=${employeeUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};

export const getAssignedIssues = async (userUuid: string): Promise<Issue[]> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ISSUES}?assignedTo=${userUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error in getAssignedIssues:', error);
    return [];
  }
};
