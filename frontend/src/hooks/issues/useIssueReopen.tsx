
import { useState } from 'react';
import { toast } from 'sonner';

export const useIssueReopen = () => {
  const [isReopening, setIsReopening] = useState(false);

  const reopenIssue = async (issueId: string, reason?: string) => {
    setIsReopening(true);
    try {
      // Mock API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Issue reopened successfully');
      return true;
    } catch (error) {
      console.error('Error reopening issue:', error);
      toast.error('Failed to reopen issue');
      return false;
    } finally {
      setIsReopening(false);
    }
  };

  const canReopen = (status: string) => {
    return ['resolved', 'closed'].includes(status);
  };

  return {
    isReopening,
    reopenIssue,
    canReopen
  };
};
