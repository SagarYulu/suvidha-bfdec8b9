
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, User, FileText, MessageSquare } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
}

interface IssueDetailModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (issueId: string, newStatus: Issue['status']) => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!issue) return null;

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{issue.title}</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(issue.priority)}>
                  {issue.priority}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              ID: {issue.id}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Issue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Reporter:</span>
                <span className="text-sm">{issue.reporter}</span>
              </div>
              {issue.assignee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Assignee:</span>
                  <span className="text-sm">{issue.assignee}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">{formatDate(issue.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Updated:</span>
                <span className="text-sm">{formatDate(issue.updatedAt)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium">Description</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{issue.description}</p>
            </div>
          </div>

          {/* Comments */}
          {issue.comments && issue.comments.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium">Comments ({issue.comments.length})</h3>
                </div>
                <div className="space-y-4">
                  {issue.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.author}</span>
                          {comment.isInternal && (
                            <Badge variant="secondary" className="text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onStatusChange && issue.status !== 'closed' && (
              <div className="flex gap-2">
                {issue.status === 'open' && (
                  <Button 
                    onClick={() => onStatusChange(issue.id, 'in_progress')}
                    variant="outline"
                  >
                    Start Progress
                  </Button>
                )}
                {issue.status === 'in_progress' && (
                  <Button 
                    onClick={() => onStatusChange(issue.id, 'resolved')}
                    variant="outline"
                  >
                    Mark Resolved
                  </Button>
                )}
                {issue.status === 'resolved' && (
                  <Button 
                    onClick={() => onStatusChange(issue.id, 'closed')}
                  >
                    Close Issue
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailModal;
