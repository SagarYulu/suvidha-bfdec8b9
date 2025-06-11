
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Issue, Comment } from '@/types';
import { getIssueById } from '@/services/api/issueService';

export const useIssueDetails = (issueId: string | undefined) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issueId ? getIssueById(issueId) : Promise.resolve(null),
    enabled: !!issueId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data) {
      setIssue(data);
      // In a real app, comments would come from the API
      setComments([]);
    }
  }, [data]);

  return {
    issue,
    setIssue,
    comments,
    setComments,
    isLoading,
    error,
    refetch
  };
};
