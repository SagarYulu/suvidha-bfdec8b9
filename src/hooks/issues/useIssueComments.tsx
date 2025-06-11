
import { useState } from "react";
import { Issue } from "@/types";
import { addComment } from "@/services/issues/issueCommentService";
import { getIssueById } from "@/services/issues/issueFetchService";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useIssueComments = (
  issueId: string | undefined,
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleAddComment = async () => {
    if (!issueId || !newComment.trim() || !currentUserId) return;
    
    setIsSubmittingComment(true);
    try {
      // Get current user info for better audit logs
      const { data: userData } = await supabase
        .from('dashboard_users')
        .select('name, role, email')
        .eq('id', currentUserId)
        .single();
      
      const userName = userData?.name || "Unknown User";
      const userRole = userData?.role;
      
      console.log(`Adding comment as user: ${userName} (${currentUserId})`);
      
      // Use addComment with the correct signature: issueId, employeeUuid, content
      await addComment(issueId, currentUserId, newComment);
      
      // Fetch the updated issue with the new comment
      const updatedIssue = await getIssueById(issueId);
      
      if (updatedIssue) {
        setIssue(updatedIssue);
        setNewComment("");
        toast({
          title: "Success",
          description: "Comment added",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return {
    newComment,
    setNewComment,
    isSubmittingComment,
    handleAddComment
  };
};
