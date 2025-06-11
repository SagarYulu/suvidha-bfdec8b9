
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  isLoading?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  comments, 
  onAddComment, 
  isLoading = false 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-gray-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {comment.user?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
                {comment.isInternal && (
                  <span className="text-xs text-blue-600 font-medium">Internal</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
