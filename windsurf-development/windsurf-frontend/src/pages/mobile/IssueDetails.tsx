
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Clock,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';

interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  isInternal?: boolean;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignedTo?: string;
  comments: Comment[];
}

const MobileIssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockIssue: Issue = {
      id: id || '1',
      title: 'Login Issues',
      description: 'Unable to log into the system with my credentials',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      assignedTo: 'John Doe',
      comments: [
        {
          id: '1',
          content: 'We are looking into this issue.',
          author: 'Support Team',
          timestamp: '2024-01-15T11:00:00Z'
        },
        {
          id: '2',
          content: 'Can you please try clearing your browser cache?',
          author: 'John Doe',
          timestamp: '2024-01-15T11:30:00Z'
        }
      ]
    };

    setTimeout(() => {
      setIssue(mockIssue);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleAddComment = () => {
    if (!newComment.trim() || !issue) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: 'You',
      timestamp: new Date().toISOString()
    };

    setIssue({
      ...issue,
      comments: [...issue.comments, comment]
    });
    setNewComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Issue Details">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!issue) {
    return (
      <MobileLayout title="Issue Details">
        <div className="p-4 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>Issue not found</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Issue Details">
      <div className="p-4 space-y-4 pb-20">
        {/* Issue Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{issue.title}</CardTitle>
              <Badge className={getStatusColor(issue.status)}>
                {issue.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">{issue.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority} priority
              </Badge>
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(issue.createdAt).toLocaleDateString()}
              </div>
              
              {issue.assignedTo && (
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  {issue.assignedTo}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments ({issue.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {issue.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add Comment */}
        {issue.status !== 'closed' && (
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
