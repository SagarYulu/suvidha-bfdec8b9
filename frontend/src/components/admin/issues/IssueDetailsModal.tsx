
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Issue } from '@/types';
import { ApiClient } from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';

interface IssueDetailsModalProps {
  issue: Issue;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  issue,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState(issue.status);
  const { toast } = useToast();

  const { data: comments = [] } = useQuery({
    queryKey: ['issue-comments', issue.id],
    queryFn: async () => {
      const response = await ApiClient.get(`/api/issues/${issue.id}/comments`);
      return response.data;
    },
    enabled: isOpen,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await ApiClient.post(`/api/issues/${issue.id}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await ApiClient.patch(`/api/issues/${issue.id}/status`, { status });
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: "Success",
        description: "Issue status updated successfully",
      });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus !== issue.status) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Issue Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Employee Information</h3>
              <p><strong>Name:</strong> {issue.emp_name}</p>
              <p><strong>Code:</strong> {issue.emp_code}</p>
              <p><strong>Email:</strong> {issue.emp_email}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Issue Information</h3>
              <p><strong>Type:</strong> {issue.issue_type}</p>
              <p><strong>Subtype:</strong> {issue.issue_subtype}</p>
              <p><strong>Priority:</strong> <Badge>{issue.priority}</Badge></p>
              <p><strong>Created:</strong> {new Date(issue.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="bg-gray-50 p-3 rounded">{issue.description}</p>
          </div>

          {/* Status Update */}
          <div className="flex items-center gap-4">
            <label className="font-semibold">Status:</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleStatusUpdate} disabled={newStatus === issue.status}>
              Update Status
            </Button>
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold mb-4">Comments</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <strong>{comment.user_name}</strong>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsModal;
