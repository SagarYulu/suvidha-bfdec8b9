
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const MobileIssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const response = await apiService.getIssue(id);
      setIssue(response.issue);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast({
        title: "Error",
        description: "Failed to load issue details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await apiService.addComment(id, newComment);
      setNewComment("");
      await fetchIssue(); // Refresh issue to get new comment
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E40AF]/10 p-4">
        <div className="bg-[#1E40AF] h-32 w-full rounded-lg mb-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white">Issue Details</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#1E40AF]/10 p-4">
        <div className="bg-[#1E40AF] h-32 w-full rounded-lg mb-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white">Issue Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Issue not found</p>
            <Button onClick={() => navigate('/mobile/issues')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E40AF]/10 p-4 pb-16">
      <div className="bg-[#1E40AF] h-32 w-full rounded-lg mb-4 flex items-center justify-between px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/mobile/issues')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Issue Details</h1>
        <div></div>
      </div>
      
      <div className="space-y-4">
        {/* Issue Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">#{issue.id}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(issue.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusBadgeColor(issue.status)}>
                {issue.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">{issue.title}</h3>
            <p className="text-gray-700 mb-4">{issue.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{issue.category}</Badge>
              <Badge variant="outline">{issue.priority}</Badge>
              {issue.assignee_name && (
                <Badge variant="secondary">Assigned to: {issue.assignee_name}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        {issue.comments && issue.comments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issue.comments.map((comment, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.author_name || 'Admin'}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Comment */}
        {issue.status !== 'closed' && (
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment here..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="w-full"
                >
                  {isSubmitting ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MobileIssueDetails;
