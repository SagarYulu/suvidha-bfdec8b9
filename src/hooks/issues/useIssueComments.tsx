
import { useState } from "react";
import { Issue } from "../../types";
import { addComment } from "../../services/issueService";
import { getIssueById } from "../../services/issues/issueFetchService";
import { toast } from "../use-toast";
import { api } from "../../lib/api";

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
      // Get current user info
      const userData = await api.get(`/users/${currentUserId}`);
      const userName = userData.data?.name || "Unknown User";
      const userRole = userData.data?.role;
      
      console.log(`Adding comment as user: ${userName} (${currentUserId})`);
      
      // Create a comment object with the right structure
      const commentData = {
        employeeUuid: currentUserId,
        content: newComment
      };
      
      // Pass the correct arguments to addComment
      await addComment(issueId, commentData);
      
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
