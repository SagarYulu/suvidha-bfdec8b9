import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types";
import { getIssueById, updateIssueStatus, addComment } from "@/services/issueService";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { mapEmployeeUuidsToNames } from "@/services/issues/issueUtils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MobileIssueDetails = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!issueId) {
      setError("Issue ID is required");
      setLoading(false);
      return;
    }

    fetchIssue();
  }, [issueId]);

  useEffect(() => {
    const fetchEmployeeNames = async () => {
      if (!issue) return;
      try {
        const names = await mapEmployeeUuidsToNames([issue.employeeUuid]);
        setEmployeeNames(names);
      } catch (err) {
        console.error("Error fetching employee names:", err);
      }
    };

    fetchEmployeeNames();
  }, [issue]);

  const fetchIssue = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedIssue = await getIssueById(issueId);
      if (fetchedIssue) {
        setIssue(fetchedIssue);
      } else {
        setError("Issue not found");
      }
    } catch (err) {
      setError("Failed to fetch issue");
      console.error("Error fetching issue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Issue["status"]) => {
    if (!issue || !authState.user) return;
    
    try {
      // Pass the current user's ID when updating the status
      console.log('Mobile: Updating status with user ID:', authState.user.id);
      const updatedIssue = await updateIssueStatus(
        issue.id, 
        newStatus, 
        authState.user.id // Pass the actual user ID
      );
      
      if (updatedIssue) {
        setIssue(updatedIssue);
        toast({
          title: "Status updated",
          description: `Issue status changed to ${newStatus}`,
        });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !issue || !authState.user) return;
    
    setSubmittingComment(true);
    
    try {
      // Use the actual user ID when adding a comment
      console.log('Mobile: Adding comment with user ID:', authState.user.id);
      const newComment = await addComment(issue.id, {
        employeeUuid: authState.user.id, // Use the authenticated user's ID
        content: commentText,
      });
      
      if (newComment) {
        // Refresh the issue to get the updated comments list
        await fetchIssue();
        setCommentText("");
        toast({
          title: "Comment added",
          description: "Your comment has been added to the issue",
        });
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading issue details...</div>;
  }

  if (error || !issue) {
    return <div className="p-4 text-red-500">Error: {error || "Issue not found"}</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-500">
            Issue ID: {issue.id}
          </div>
          <div className="text-sm text-gray-500">
            Employee: {employeeNames[issue.employeeUuid] || "Unknown"}
          </div>
          <div className="text-sm text-gray-500">
            Type: {getIssueTypeLabel(issue.typeId)} - {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
          </div>
          <div className="text-sm text-gray-500">
            Description: {issue.description}
          </div>
          <div className="text-sm text-gray-500">
            Created At: {formatDate(issue.createdAt)}
          </div>
          <div className="text-sm text-gray-500">
            Updated At: {formatDate(issue.updatedAt)}
          </div>
          <div>
            Status: <Badge className={getStatusBadgeClass(issue.status)}>{issue.status}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button onClick={() => handleStatusChange("open")} disabled={issue.status === "open"}>
              Mark as Open
            </Button>
            <Button onClick={() => handleStatusChange("in_progress")} disabled={issue.status === "in_progress"}>
              Mark as In Progress
            </Button>
            <Button onClick={() => handleStatusChange("resolved")} disabled={issue.status === "resolved"}>
              Mark as Resolved
            </Button>
            <Button onClick={() => handleStatusChange("closed")} disabled={issue.status === "closed"}>
              Mark as Closed
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment"
            />
            <Button type="submit" disabled={submittingComment}>
              {submittingComment ? "Adding..." : "Add Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {issue.comments.length === 0 ? (
            <div className="text-sm text-gray-500">No comments yet.</div>
          ) : (
            <div className="space-y-2">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="border rounded-md p-2">
                  <div className="text-xs text-gray-400">
                    {employeeNames[comment.employeeUuid] || "Unknown"} - {formatDate(comment.createdAt)}
                  </div>
                  <div className="text-sm">{comment.content}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileIssueDetails;
