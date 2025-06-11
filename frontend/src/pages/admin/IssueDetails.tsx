
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, User, AlertCircle, MessageSquare } from 'lucide-react';
import { IssueService } from '@/services/issueService';
import { Issue } from '@/types';
import { toast } from 'sonner';

export default function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue();
    }
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const data = await IssueService.getIssueById(id!);
      setIssue(data);
    } catch (error) {
      console.error('Error loading issue:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!issue) return;
    
    try {
      setIsUpdating(true);
      await IssueService.updateIssue(issue.id, { status: newStatus as any });
      setIssue({ ...issue, status: newStatus as any });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!issue || !newComment.trim()) return;
    
    try {
      const comment = await IssueService.addComment(issue.id, newComment);
      setIssue({
        ...issue,
        comments: [...issue.comments, comment]
      });
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Issue not found</h3>
        <Button onClick={() => navigate('/admin/issues')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/issues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
          <h1 className="text-2xl font-bold">Issue #{issue.id.substring(0, 8)}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(issue.status)}>
            {issue.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityColor(issue.priority)}>
            {issue.priority.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Description</h4>
                <p className="text-gray-900">{issue.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Type ID</h4>
                  <p className="text-gray-900">{issue.typeId}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Sub Type ID</h4>
                  <p className="text-gray-900">{issue.subTypeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Created</h4>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(issue.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Last Updated</h4>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(issue.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {issue.attachmentUrl && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Attachment</h4>
                  <a
                    href={issue.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Comments ({issue.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {issue.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.employeeUuid}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-sm text-gray-500">Employee UUID:</span>
                  <p className="text-gray-900">{issue.employeeUuid}</p>
                </div>
                {issue.employee && (
                  <>
                    <div>
                      <span className="font-medium text-sm text-gray-500">Name:</span>
                      <p className="text-gray-900">{issue.employee.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-500">Email:</span>
                      <p className="text-gray-900">{issue.employee.email}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={issue.status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
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
            </CardContent>
          </Card>

          {/* Assignment */}
          {issue.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{issue.assignedTo}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
