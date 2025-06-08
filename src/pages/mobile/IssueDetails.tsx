
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Clock, User, MessageCircle, Paperclip } from 'lucide-react';
import FeedbackCollectionCard from '@/components/feedback/FeedbackCollectionCard';

interface Issue {
  id: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

interface Comment {
  id: string;
  content: string;
  employeeUuid: string;
  createdAt: string;
}

const MobileIssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIssueDetails();
    }
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIssue(data.issue);
        setComments(data.comments || []);
        
        // Show feedback form if issue is resolved/closed
        if (data.issue.status === 'resolved' || data.issue.status === 'closed') {
          setShowFeedback(true);
        }
      } else {
        throw new Error('Failed to fetch issue details');
      }
    } catch (error) {
      console.error('Error fetching issue details:', error);
      toast({
        title: "Failed to load issue details",
        description: "Please try again later.",
        variant: "destructive"
      });
      navigate('/mobile/issues');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/issues/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
        toast({
          title: "Comment added successfully"
        });
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Failed to add comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Issue Details">
        <div className="p-4 text-center">Loading...</div>
      </MobileLayout>
    );
  }

  if (!issue) {
    return (
      <MobileLayout title="Issue Details">
        <div className="p-4 text-center">Issue not found</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Issue Details">
      <div className="p-4 space-y-4">
        {/* Issue Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {issue.typeId.toUpperCase()} - {issue.subTypeId}
              </CardTitle>
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority}
              </Badge>
            </div>
            <Badge className={getStatusColor(issue.status)}>
              {issue.status.replace('_', ' ')}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{issue.description}</p>
            </div>
            
            {issue.attachments && issue.attachments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attachments
                </h4>
                <div className="space-y-1">
                  {issue.attachments.map((attachment, index) => (
                    <div key={index} className="text-sm text-blue-600">
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Created: {new Date(issue.createdAt).toLocaleString()}
            </div>
            
            {issue.updatedAt !== issue.createdAt && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Updated: {new Date(issue.updatedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <User className="h-3 w-3 mr-1" />
                    {comment.employeeUuid} • {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
            
            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button 
                onClick={addComment}
                disabled={!newComment.trim()}
                className="w-full"
              >
                Add Comment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Collection - Show only for resolved/closed issues */}
        {showFeedback && (
          <FeedbackCollectionCard 
            issueId={issue.id}
            onSubmit={() => setShowFeedback(false)}
          />
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
