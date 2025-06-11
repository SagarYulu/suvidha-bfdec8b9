import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageCircle, Send, Phone, Mail } from 'lucide-react';
import { Issue } from '@/types';
import { IssueService } from '@/services/issueService';
import { toast } from 'sonner';

const MobileIssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue();
    }
  }, [id]);

  const loadIssue = async () => {
    try {
      if (!id) return;
      const data = await IssueService.getIssueById(id);
      setIssue(data);
    } catch (error) {
      console.error('Error loading issue:', error);
      toast.error('Failed to load issue details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await IssueService.addComment(id, comment);
      setComment('');
      toast.success('Comment added successfully');
      loadIssue(); // Reload to get updated comments
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Issue Details">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!issue) {
    return (
      <MobileLayout title="Issue Details">
        <div className="p-4 text-center">
          <p className="text-gray-500">Issue not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mobile/issues')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Issue Details">
      <div className="p-4 space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/mobile/issues')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-lg font-semibold">
                Issue #{issue.id.slice(0, 8)}
              </h1>
              <div className="flex gap-2">
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-700">Description</h3>
                <p className="text-gray-600">{issue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-600">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated:</span>
                  <p className="text-gray-600">
                    {new Date(issue.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {issue.assignedToName && (
                <div>
                  <span className="font-medium text-gray-700">Assigned to:</span>
                  <p className="text-gray-600">{issue.assignedToName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments
            </h3>

            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleAddComment}
                disabled={!comment.trim() || isSubmittingComment}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmittingComment ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>

            {/* Existing comments would be displayed here */}
            <div className="mt-4 text-center text-gray-500">
              <p>No comments yet</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Need Help?</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
