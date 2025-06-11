
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Issue } from '@/types';
import { IssueService } from '@/services/issueService';

interface IssueDetailsModalProps {
  issue: Issue;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  issue,
  open,
  onClose,
  onUpdate
}) => {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(issue.status);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      await IssueService.updateIssueStatus(issue.id, status);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      setLoading(true);
      await IssueService.addComment(issue.id, comment);
      setComment('');
      onUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issue.title || `${issue.issue_type} - ${issue.issue_subtype}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Issue Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Issue Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span>{issue.issue_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtype:</span>
                  <span>{issue.issue_subtype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge>{issue.priority}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge>{issue.status}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Employee Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{issue.emp_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{issue.emp_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span>{issue.emp_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span>{issue.city_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{issue.description}</p>
          </div>

          {/* Status Update */}
          <div className="flex gap-4 items-center">
            <Select value={status} onValueChange={setStatus}>
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
            <Button onClick={handleStatusUpdate} disabled={loading || status === issue.status}>
              Update Status
            </Button>
          </div>

          {/* Add Comment */}
          <div>
            <h3 className="font-semibold mb-2">Add Comment</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={loading || !comment.trim()}>
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
