
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Tag, FileText, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Issue {
  id: string;
  title?: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  subType?: string;
  assignedTo?: string;
  employeeName: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  attachments?: string[];
}

interface IssueDetailsCardProps {
  issue: Issue;
  onEdit?: () => void;
  onAssign?: () => void;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ 
  issue, 
  onEdit, 
  onAssign 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Issue Details
          </CardTitle>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onAssign && (
              <Button variant="outline" size="sm" onClick={onAssign}>
                Assign
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status and Priority */}
        <div className="flex gap-2">
          <Badge className={getStatusColor(issue.status)}>
            {issue.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityColor(issue.priority)}>
            {issue.priority.toUpperCase()} PRIORITY
          </Badge>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
            {issue.description}
          </p>
        </div>

        {/* Issue Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-gray-600">{issue.type}</p>
              {issue.subType && (
                <p className="text-xs text-gray-500">{issue.subType}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Reported By</p>
              <p className="text-sm text-gray-600">{issue.employeeName}</p>
            </div>
          </div>
        </div>

        {/* Assignment */}
        {issue.assignedTo && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Assigned To</p>
              <p className="text-sm text-gray-600">{issue.assignedTo}</p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {issue.closedAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Closed</p>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(issue.closedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Attachments */}
        {issue.attachments && issue.attachments.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments ({issue.attachments.length})
            </h4>
            <div className="space-y-2">
              {issue.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Paperclip className="h-3 w-3 text-gray-500" />
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {attachment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueDetailsCard;
