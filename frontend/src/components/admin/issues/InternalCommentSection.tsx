
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface InternalComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Internal Comments
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Team Only
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No internal comments yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-200 text-blue-700">
                    {getInitials(comment.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-blue-900">{comment.authorName}</span>
                    <span className="text-xs text-blue-600">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-blue-800 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t pt-4">
          <Textarea
            placeholder="Add an internal comment (visible only to team members)..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-blue-600">
              Internal comments are only visible to team members
            </p>
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Adding...' : 'Add Internal Comment'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InternalCommentSection;
