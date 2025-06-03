
import { api } from '../../lib/api';
import { useState } from 'react';

export const updateIssuePriority = async (issue: any) => {
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

export const updateAllIssuePriorities = async () => {
  try {
    await api.post('/issues/update-all-priorities');
  } catch (error) {
    console.error('Error updating all issue priorities:', error);
  }
};

export const usePriorityUpdater = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePriority = async (issue: any) => {
    setIsUpdating(true);
    try {
      const result = await updateIssuePriority(issue);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePriority,
    isUpdating
  };
};
