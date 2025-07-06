
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  isInternal: boolean;
}

interface CommentSectionProps {
  issueId: string;
  allowComments?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  issueId,
  allowComments = true
}) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      // Simulate API call
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: newComment,
        authorName: 'Current User',
        authorRole: 'Admin',
        createdAt: new Date().toISOString(),
        isInternal: false
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{comment.authorName}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.authorRole}
                    </Badge>
                    {comment.isInternal && (
                      <Badge variant="secondary" className="text-xs">
                        Internal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        {allowComments && (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isAddingComment}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isAddingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentSection;
