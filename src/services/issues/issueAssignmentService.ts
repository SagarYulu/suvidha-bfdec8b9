
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';
import { Issue } from "../../types";

export const assignIssueToUser = async (
  issueId: string,
  assigneeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    const response = await api.patch(`${API_ENDPOINTS.ISSUES}/${issueId}/assign`, {
      assigneeId,
      currentUserId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};
