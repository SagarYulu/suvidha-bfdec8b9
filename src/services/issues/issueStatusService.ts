
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';
import { Issue } from "../../types";

export const updateIssueStatus = async (
  issueId: string,
  newStatus: Issue["status"],
  userId: string
): Promise<Issue | null> => {
  try {
    const response = await api.patch(`${API_ENDPOINTS.ISSUES}/${issueId}/status`, {
      status: newStatus,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};
