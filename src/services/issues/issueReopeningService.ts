
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';
import { Issue } from "../../types";

export const reopenTicket = async (
  issueId: string, 
  reopenReason: string,
  userId: string
): Promise<Issue | null> => {
  try {
    const response = await api.patch(`${API_ENDPOINTS.ISSUES}/${issueId}/reopen`, {
      reopenReason,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error reopening ticket:', error);
    throw error;
  }
};
