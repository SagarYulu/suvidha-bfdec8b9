
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';
import { Issue } from "../../types";

export const mapIssueType = async (
  issueId: string,
  newTypeId: string,
  newSubTypeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    const response = await api.patch(`${API_ENDPOINTS.ISSUES}/${issueId}/map`, {
      newTypeId,
      newSubTypeId,
      currentUserId
    });
    return response.data;
  } catch (error) {
    console.error("Error in mapIssueType:", error);
    return null;
  }
};

export const isIssueMappable = (issue: Issue | null): boolean => {
  if (!issue) return false;
  return issue.typeId === "others";
};
