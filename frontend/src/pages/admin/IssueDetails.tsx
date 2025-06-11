
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { issueService } from '@/services/api/issueService';
import { Issue, Comment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Clock, User, MapPin } from 'lucide-react';

const IssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssueDetails(id);
      loadComments(id);
    }
  }, [id]);

  const loadIssueDetails = async (issueId: string) => {
    try {
      const data = await issueService.getIssueById(issueId);
      setIssue(data);
    } catch (error) {
      console.error('Error loading issue details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load issue details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (issueId: string) => {
    try {
      const data = await issueService.getIssueComments(issueId);
      setComments([...data.public_comments, ...data.internal_comments]);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!issue) return;

    try {
      await issueService.updateIssueStatus(issue.id, newStatus);
      setIssue({ ...issue, status: newStatus as any });
      toast({
        title: 'Success',
        description: 'Issue status updated successfully',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update issue status',
        variant: 'destructive',
      });
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!issue) return;

    try {
      await issueService.updateIssuePriority(issue.id, newPriority);
      setIssue({ ...issue, priority: newPriority as any });
      toast({
        title: 'Success',
        description: 'Issue priority updated successfully',
      });
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update issue priority',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!issue || !newComment.trim()) return;

    try {
      setAddingComment(true);
      await issueService.addComment(issue.id, newComment);
      setNewComment('');
      await loadComments(issue.id);
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setAddingComment(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Issue Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!issue) {
    return (
      <AdminLayout title="Issue Details">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Issue not found</h2>
          <Button onClick={() => navigate('/admin/issues')}>
            Back to Issues
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Issue #${issue.id.slice(0, 8)}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/issues')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issues
          </Button>
          <div className="flex gap-2">
            <Badge variant={getStatusBadgeVariant(issue.status)}>
              {issue.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(issue.priority)}>
              {issue.priority}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Issue Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{issue.title || 'No Title'}</h3>
                  <p className="text-gray-600">{issue.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Employee: {issue.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  {issue.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location: {issue.city}{issue.cluster ? `, ${issue.cluster}` : ''}</span>
                    </div>
                  )}
                  <div>
                    <span>Type: {issue.issueType || issue.typeId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      {comment.isInternal && (
                        <Badge variant="outline" className="mt-1">Internal</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}

                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                  >
                    {addingComment ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={issue.status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={issue.priority} onValueChange={handlePriorityUpdate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {issue.additionalDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {JSON.stringify(issue.additionalDetails, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default IssueDetails;
