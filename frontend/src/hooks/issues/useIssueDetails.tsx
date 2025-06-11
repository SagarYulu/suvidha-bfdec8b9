
import { useState, useEffect } from 'react';
import { Issue } from '@/types';
import { IssueService } from '@/services/issueService';

export const useIssueDetails = (issueId: string | undefined) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (issueId) {
      loadIssueDetails();
    }
  }, [issueId]);

  const loadIssueDetails = async () => {
    if (!issueId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await IssueService.getIssueById(issueId);
      setIssue(data);
    } catch (err) {
      console.error('Error loading issue details:', err);
      setError('Failed to load issue details');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIssue = () => {
    loadIssueDetails();
  };

  const updateIssueLocal = (updates: Partial<Issue>) => {
    if (issue) {
      setIssue({ ...issue, ...updates });
    }
  };

  return {
    issue,
    isLoading,
    error,
    refreshIssue,
    updateIssueLocal
  };
};
