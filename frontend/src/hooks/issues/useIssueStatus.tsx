
import { useState } from 'react';
import { toast } from 'sonner';

export const useIssueStatus = () => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const updateStatus = async (issueId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      // Mock API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      return false;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const statusTransitions: Record<string, string[]> = {
      'open': ['in_progress', 'resolved', 'closed'],
      'in_progress': ['open', 'resolved', 'escalated'],
      'resolved': ['closed', 'open'],
      'closed': ['open'],
      'escalated': ['in_progress', 'resolved']
    };

    return statusTransitions[currentStatus] || [];
  };

  const canChangeStatus = (currentStatus: string, newStatus: string) => {
    const availableStatuses = getAvailableStatuses(currentStatus);
    return availableStatuses.includes(newStatus);
  };

  return {
    isUpdatingStatus,
    updateStatus,
    getAvailableStatuses,
    canChangeStatus
  };
};
