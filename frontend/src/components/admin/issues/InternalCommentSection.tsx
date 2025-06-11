
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lock, Send, User, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InternalComment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  visibility: 'internal' | 'admin_only';
}

interface InternalCommentSectionProps {
  issueId: string;
  canAddComments?: boolean;
}

const InternalCommentSection: React.FC<InternalCommentSectionProps> = ({
  issueId,
  canAddComments = true
}) => {
  const [newComment, setNewComment] = useState('');
  const [visibility, setVisibility] = useState<'internal' | 'admin_only'>('internal');
  const [internalComments, setInternalComments] = useState<InternalComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      const newCommentObj: InternalComment = {
        id: Date.now().toString(),
        content: newComment,
        authorName: 'Current User',
        authorRole: 'Admin',
        createdAt: new Date().toISOString(),
        visibility
      };
      
      setInternalComments(prev => [...prev, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add internal comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-red-600" />
          Internal Comments ({internalComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Internal comments are not visible to end users
            </span>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : internalComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No internal comments yet.
            </div>
          ) : (
            internalComments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{comment.authorName}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.authorRole}
                    </Badge>
                    <Badge 
                      variant={comment.visibility === 'admin_only' ? 'destructive' : 'secondary'} 
                      className="text-xs flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {comment.visibility === 'admin_only' ? 'Admin Only' : 'Internal'}
                    </Badge>
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

        {/* Add Internal Comment Form */}
        {canAddComments && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex gap-2 mb-2">
              <Button
                variant={visibility === 'internal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibility('internal')}
              >
                Internal Team
              </Button>
              <Button
                variant={visibility === 'admin_only' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisibility('admin_only')}
              >
                Admin Only
              </Button>
            </div>
            
            <Textarea
              placeholder="Add an internal comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-red-50"
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isAddingComment}
                className="flex items-center gap-2"
                variant="destructive"
              >
                <Send className="h-4 w-4" />
                {isAddingComment ? 'Posting...' : 'Post Internal Comment'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InternalCommentSection;
