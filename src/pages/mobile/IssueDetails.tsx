
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import {
  getIssueById,
  getIssueTypeLabel,
  getIssueSubTypeLabel,
  addComment,
} from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { Issue, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Clock, MessageSquare, User as UserIcon } from "lucide-react";

const MobileIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const issueData = await getIssueById(id);
        if (!issueData) {
          setErrorMessage("Issue not found");
          return;
        }
        
        if (issueData.userId !== authState.user?.id) {
          setErrorMessage("You do not have permission to view this issue");
          return;
        }
        
        setIssue(issueData);
        
        // Fetch commenter names
        const uniqueUserIds = new Set<string>();
        issueData.comments.forEach(comment => uniqueUserIds.add(comment.userId));
        
        const namesPromises = Array.from(uniqueUserIds).map(async (userId) => {
          try {
            const user = await getUserById(userId);
            return user ? { userId, name: user.name } : null;
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(namesPromises);
        const names: Record<string, string> = {};
        results.forEach(result => {
          if (result) {
            names[result.userId] = result.name;
          }
        });
        
        setCommenterNames(names);
      } catch (error) {
        console.error("Error fetching issue:", error);
        setErrorMessage("An error occurred while fetching the issue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [id, authState.user?.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user?.id || !id) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedIssue = await addComment(id, {
        userId: authState.user.id,
        content: newComment.trim(),
      });
      
      if (updatedIssue) {
        setIssue(updatedIssue);
        setNewComment("");
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
        
        // Update commenter names
        if (authState.user && !commenterNames[authState.user.id]) {
          setCommenterNames(prev => ({
            ...prev,
            [authState.user!.id]: authState.user!.name,
          }));
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <MobileLayout title="Issue Details">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
        </div>
      </MobileLayout>
    );
  }

  if (errorMessage || !issue) {
    return (
      <MobileLayout title="Issue Details">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">{errorMessage || "Issue not found"}</h3>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Issue Details">
      <div className="pb-16">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold text-lg">
              {getIssueTypeLabel(issue.typeId)}
            </h2>
            <Badge className={getStatusBadgeColor(issue.status)}>
              {issue.status.replace("_", " ")}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
          </p>
          
          <div className="text-sm mb-4">
            <p className="flex items-center text-gray-500 mb-1">
              <Clock className="h-3 w-3 mr-1" />
              Created on {formatDate(issue.createdAt)}
            </p>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <h3 className="font-medium mb-2">Description:</h3>
            <p className="text-gray-700">{issue.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-semibold flex items-center mb-3">
            <MessageSquare className="h-4 w-4 mr-1" />
            Comments ({issue.comments.length})
          </h3>
          
          <div className="space-y-4">
            {issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-yulu-blue text-white flex items-center justify-center text-xs">
                        {commenterNames[comment.userId]?.[0] || "?"}
                      </div>
                      <span className="ml-2 font-medium text-sm">
                        {commenterNames[comment.userId] || "Unknown user"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm pl-8">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No comments yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-3">Add a comment</h3>
          <form onSubmit={handleSubmitComment}>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment here..."
              className="mb-3"
              rows={3}
            />
            <Button 
              type="submit" 
              className="w-full bg-yulu-blue hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </Button>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
