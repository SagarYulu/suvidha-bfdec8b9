
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Tag, Calendar, AlertTriangle, Paperclip } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Issue } from '@/types';

interface IssueDetailsCardProps {
  issue: Issue;
  onEdit?: () => void;
  canEdit?: boolean;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({
  issue,
  onEdit,
  canEdit = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Issue Details
          </CardTitle>
          {canEdit && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status and Priority */}
        <div className="flex gap-2">
          <Badge className={getStatusColor(issue.status)}>
            {issue.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityColor(issue.priority)}>
            {issue.priority.toUpperCase()}
          </Badge>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {/* Issue Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Type</span>
            </div>
            <p className="text-sm text-gray-700">{issue.typeLabel || issue.typeId}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Sub Type</span>
            </div>
            <p className="text-sm text-gray-700">{issue.subTypeLabel || issue.subTypeId}</p>
          </div>
        </div>

        {/* Assignment */}
        {issue.assignedTo && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Assigned To</span>
            </div>
            <p className="text-sm text-gray-700">{issue.assignedTo}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Created</span>
            </div>
            <p className="text-sm text-gray-700">{formatDate(issue.createdAt)}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Last Updated</span>
            </div>
            <p className="text-sm text-gray-700">{formatDate(issue.updatedAt)}</p>
          </div>
        </div>

        {/* Closed Date */}
        {issue.closedAt && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Closed</span>
            </div>
            <p className="text-sm text-gray-700">{formatDate(issue.closedAt)}</p>
          </div>
        )}

        {/* Attachments */}
        {issue.attachmentUrl && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Attachment</span>
            </div>
            <a 
              href={issue.attachmentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Attachment
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueDetailsCard;
