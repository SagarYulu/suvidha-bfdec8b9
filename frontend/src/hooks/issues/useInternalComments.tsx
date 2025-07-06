
import { useState, useEffect } from 'react';
import { internalCommentService } from '@/services/issues/internalCommentService';
import { toast } from '@/hooks/use-toast';

interface InternalComment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  visibility: 'internal' | 'admin_only';
}

export const useInternalComments = (issueId: string) => {
  const [internalComments, setInternalComments] = useState<InternalComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    if (issueId) {
      loadInternalComments();
    }
  }, [issueId]);

  const loadInternalComments = async () => {
    try {
      setIsLoading(true);
      const comments = await internalCommentService.getInternalComments(issueId);
      setInternalComments(comments);
    } catch (error) {
      console.error('Failed to load internal comments:', error);
      toast({
        title: "Error",
        description: "Failed to load internal comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addInternalComment = async (content: string, visibility: 'internal' | 'admin_only') => {
    try {
      setIsAddingComment(true);
      await internalCommentService.addInternalComment(issueId, content, visibility);
      await loadInternalComments(); // Reload to get the new comment
      toast({
        title: "Success",
        description: "Internal comment added successfully"
      });
    } catch (error) {
      console.error('Failed to add internal comment:', error);
      toast({
        title: "Error",
        description: "Failed to add internal comment",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAddingComment(false);
    }
  };

  return {
    internalComments,
    isLoading,
    isAddingComment,
    addInternalComment,
    refreshComments: loadInternalComments
  };
};
