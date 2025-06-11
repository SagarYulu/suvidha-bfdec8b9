
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Lock } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface InternalComment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  author: {
    name: string;
    role: string;
  };
}

interface InternalCommentSectionProps {
  issueId: string;
  comments: InternalComment[];
  onAddComment: (content: string) => void;
  isLoading?: boolean;
}

const InternalCommentSection: React.FC<InternalCommentSectionProps> = ({
  issueId,
  comments,
  onAddComment,
  isLoading = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-orange-600" />
          Internal Comments
          <Badge variant="secondary">Admin Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Comment */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add an internal comment (Ctrl+Enter to send)..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No internal comments yet</p>
              <p className="text-sm">Add the first internal comment to start the discussion</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-orange-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm">
                      {comment.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comment.author.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {comment.author.role}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap pl-10">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InternalCommentSection;
