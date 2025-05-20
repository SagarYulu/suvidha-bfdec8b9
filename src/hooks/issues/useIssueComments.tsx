
import { useState } from "react";
import { Issue } from "@/types";
import { addComment } from "@/services/issueService";
import { getIssueById } from "@/services/issues/issueFetchService";
import { toast } from "@/hooks/use-toast";

export const useIssueComments = (
  issueId: string | undefined,
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!issueId || !newComment.trim() || !currentUserId) return;
    
    setIsSubmittingComment(true);
    try {
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

  const handleAddPrivateComment = async (message: string): Promise<void> => {
    if (!issueId || !message.trim() || !currentUserId) return;
    
    try {
      // Create a comment object with the right structure
      const commentData = {
        employeeUuid: currentUserId,
        content: message,
        isPrivate: true // Mark this as a private message
      };
      
      // Pass the correct arguments to addComment
      await addComment(issueId, commentData);
      
      // Fetch the updated issue with the new comment
      const updatedIssue = await getIssueById(issueId);
      
      if (updatedIssue) {
        setIssue(updatedIssue);
        toast({
          title: "Success",
          description: "Private message sent",
        });
      }
    } catch (error) {
      console.error("Error adding private comment:", error);
      toast({
        title: "Error",
        description: "Failed to send private message",
        variant: "destructive",
      });
    }
  };

  return {
    newComment,
    setNewComment,
    isSubmittingComment,
    handleAddComment,
    handleAddPrivateComment
  };
};
