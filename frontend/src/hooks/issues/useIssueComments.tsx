
import { useState, useEffect } from 'react';
import { issueCommentService } from '@/services/issues/issueCommentService';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  isInternal: boolean;
}

export const useIssueComments = (issueId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    if (issueId) {
      loadComments();
    }
  }, [issueId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const loadedComments = await issueCommentService.getComments(issueId);
      setComments(loadedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      setIsAddingComment(true);
      await issueCommentService.addComment(issueId, content);
      await loadComments(); // Reload to get the new comment
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAddingComment(false);
    }
  };

  return {
    comments,
    isLoading,
    isAddingComment,
    addComment,
    refreshComments: loadComments
  };
};
