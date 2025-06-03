
import { api } from '../../lib/api';
import { Issue } from '../../types';

export const updateIssuePriority = async (issue: Issue): Promise<Issue | null> => {
  try {
    const response = await api.patch(`/issues/${issue.id}/priority`, {
      priority: issue.priority
    });
    return response.data;
  } catch (error) {
    console.error('Error updating issue priority:', error);
    return issue; // Return original issue if update fails
  }
};

export const updateAllIssuePriorities = async (): Promise<void> => {
  try {
    await api.post('/issues/update-all-priorities');
  } catch (error) {
    console.error('Error updating all issue priorities:', error);
  }
};
