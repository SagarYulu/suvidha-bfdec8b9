
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Issue, IssueComment } from "@/types";
import { getIssueById, updateIssueStatus, addComment } from "@/services/issueService";
import { mapEmployeeUuidsToNames } from "@/services/issues/issueUtils";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const IssueDetails = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});

  // Debug log to verify issue ID is received correctly
  console.log("Admin IssueDetails - Current issueId from URL:", issueId);

  useEffect(() => {
    const fetchIssueData = async () => {
      if (!issueId) {
        console.error("Issue ID is missing from URL parameters");
        setError("Issue ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching issue with ID:", issueId);
        const fetchedIssue = await getIssueById(issueId);
        
        if (fetchedIssue) {
          console.log("Issue data loaded:", fetchedIssue);
          setIssue(fetchedIssue);
          
          // Fetch employee names
          const employeeUuids = [
            fetchedIssue.employeeUuid,
            ...fetchedIssue.comments.map(comment => comment.employeeUuid)
          ];
          
          const uniqueUuids = [...new Set(employeeUuids)];
          const names = await mapEmployeeUuidsToNames(uniqueUuids);
          setEmployeeNames(names);
        } else {
          console.error("Issue not found for ID:", issueId);
          setError("Issue not found");
        }
      } catch (err) {
        console.error("Error fetching issue:", err);
        setError("Failed to load issue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueData();
  }, [issueId]);

  const handleStatusChange = async (newStatus: Issue["status"]) => {
    if (!issue || !authState.user || !issueId) {
      console.error("Missing required data for status update:", {
        issue: !!issue,
        user: !!authState.user,
        issueId: !!issueId
      });
      return;
    }
    
    try {
      console.log('Updating status with user ID:', authState.user.id);
      const updatedIssue = await updateIssueStatus(
        issueId, 
        newStatus, 
        authState.user.id
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
    
    if (!commentText.trim() || !issue || !authState.user || !issueId) {
      console.error("Missing required data for adding comment:", {
        commentText: !!commentText.trim(),
        issue: !!issue,
        user: !!authState.user,
        issueId: !!issueId
      });
      return;
    }
    
    setSubmittingComment(true);
    
    try {
      console.log('Adding comment with user ID:', authState.user.id);
      const newComment = await addComment(issueId, {
        employeeUuid: authState.user.id,
        content: commentText,
      });
      
      if (newComment) {
        // Refresh the issue to get the updated comments list
        const updatedIssue = await getIssueById(issueId);
        if (updatedIssue) {
          setIssue(updatedIssue);
          
          // Update employee names if there are new commenters
          const allUuids = [
            updatedIssue.employeeUuid,
            ...updatedIssue.comments.map(comment => comment.employeeUuid)
          ];
          const uniqueUuids = [...new Set(allUuids)];
          const names = await mapEmployeeUuidsToNames(uniqueUuids);
          setEmployeeNames(names);
        }
        
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
    return (
      <div className="container mx-auto mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">Error: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/issues')}>
              Back to Issues List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto mt-8">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-600 font-semibold">Issue not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/issues')}>
              Back to Issues List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Issues
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>ID</Label>
              <Input type="text" value={issue.id} readOnly />
            </div>
            <div>
              <Label>Employee</Label>
              <Input type="text" value={employeeNames[issue.employeeUuid] || "Unknown"} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ticket Type</Label>
              <Input type="text" value={getIssueTypeLabel(issue.typeId)} readOnly />
            </div>
            <div>
              <Label>Sub Type</Label>
              <Input type="text" value={getIssueSubTypeLabel(issue.typeId, issue.subTypeId)} readOnly />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={issue.description} readOnly />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${
                  issue.status === "open" ? "bg-red-100 text-red-800" :
                  issue.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {issue.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Priority</Label>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${
                  issue.priority === "high" ? "bg-red-100 text-red-800" :
                  issue.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {issue.priority}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Created At</Label>
              <Input type="text" value={new Date(issue.createdAt).toLocaleDateString()} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Button onClick={() => handleStatusChange("open")}>Mark as Open</Button>
            </div>
            <div>
              <Button onClick={() => handleStatusChange("in_progress")}>Mark as In Progress</Button>
            </div>
            <div>
              <Button onClick={() => handleStatusChange("resolved")}>Mark as Resolved</Button>
            </div>
            <div>
              <Button onClick={() => handleStatusChange("closed")}>Mark as Closed</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="grid gap-2">
              <Label htmlFor="comment">Add a comment</Label>
              <Textarea
                id="comment"
                placeholder="Type your comment here"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button disabled={submittingComment}>
                {submittingComment ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </form>

          {issue.comments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issue.comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>{employeeNames[comment.employeeUuid] || "Unknown"}</TableCell>
                    <TableCell>{comment.content}</TableCell>
                    <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground">No comments yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetails;
