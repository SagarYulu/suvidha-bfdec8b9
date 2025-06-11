
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, User, MessageSquare, AlertCircle } from 'lucide-react';
import { IssueService } from '@/services/issueService';
import { Issue } from '@/types';
import { toast } from 'sonner';

export default function MobileIssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

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
      <MobileLayout title="Issue Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!issue) {
    return (
      <MobileLayout title="Issue Not Found">
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Issue not found</h3>
          <Button onClick={() => navigate('/mobile/issues')}>
            Back to Issues
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={`Issue #${issue.id.substring(0, 8)}`}>
      <div className="p-4 space-y-4">
        {/* Status and Priority */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(issue.status)}>
            {issue.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityColor(issue.priority)}>
            {issue.priority.toUpperCase()}
          </Badge>
        </div>

        {/* Issue Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">Description</h4>
              <p className="text-gray-900">{issue.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Type</h4>
                <p className="text-gray-900">{issue.typeId}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Sub Type</h4>
                <p className="text-gray-900">{issue.subTypeId}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">Created</h4>
              <div className="flex items-center text-gray-900 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(issue.createdAt).toLocaleString()}
              </div>
            </div>

            {issue.attachmentUrl && (
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Attachment</h4>
                <a
                  href={issue.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View Attachment
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center mb-4">
              <MessageSquare className="mr-2 h-5 w-5" />
              Comments ({issue.comments.length})
            </h3>
            
            {issue.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No comments yet</p>
            ) : (
              <div className="space-y-3 mb-4">
                {issue.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.employeeUuid}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={!newComment.trim()}
                className="w-full"
              >
                Add Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
