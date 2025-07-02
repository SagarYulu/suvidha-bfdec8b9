
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, User, AlertCircle } from 'lucide-react';
import { IssueService } from '@/services/issueService';
import { Issue } from '@/types';
import { toast } from 'sonner';

export default function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

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
      setIsAddingComment(true);
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
    } finally {
      setIsAddingComment(false);
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
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!issue) {
    return (
      <MobileLayout title="Issue Details">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium">Issue not found</h3>
          <Button onClick={() => navigate('/mobile/issues')} className="mt-4">
            Back to Issues
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title="Issue Details"
      showBackButton
      onBackClick={() => navigate('/mobile/issues')}
    >
      <div className="p-4 space-y-4">
        {/* Issue Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Issue #{issue.id.substring(0, 8)}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{issue.description}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Type:</span>
                <p>{issue.typeId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Sub Type:</span>
                <p>{issue.subTypeId}</p>
              </div>
            </div>

            {issue.assignedTo && (
              <div className="mt-4">
                <span className="font-medium text-gray-500">Assigned to:</span>
                <p className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-1" />
                  {issue.assignedTo}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comments ({issue.comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {issue.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {issue.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{comment.employeeUuid}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {issue.status !== 'closed' && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || isAddingComment}
                  className="w-full"
                >
                  {isAddingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
