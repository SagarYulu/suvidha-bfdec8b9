
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, AlertTriangle, FileText } from 'lucide-react';
import { Issue } from '@/types';

interface IssueDetailsCardProps {
  issue: Issue;
  onStatusChange?: (newStatus: Issue['status']) => void;
  onPriorityChange?: (newPriority: Issue['priority']) => void;
  isLoading?: boolean;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({
  issue,
  onStatusChange,
  onPriorityChange,
  isLoading = false
}) => {
  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Issue #{issue.id.slice(-8)}
          </span>
          <div className="flex gap-2">
            <Badge className={getStatusColor(issue.status)}>
              {issue.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(issue.priority)}>
              {issue.priority}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {issue.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">Type</h4>
            <p>{issue.typeLabel || 'Unknown'}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">Sub Type</h4>
            <p>{issue.subTypeLabel || 'Unknown'}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">Created</h4>
            <p className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3" />
              {new Date(issue.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">Assigned To</h4>
            <p className="flex items-center gap-1 text-sm">
              <User className="h-3 w-3" />
              {issue.assignedTo || 'Unassigned'}
            </p>
          </div>
        </div>

        {issue.attachmentUrl && (
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-2">Attachments</h4>
            <Button variant="outline" size="sm" asChild>
              <a href={issue.attachmentUrl} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          {onStatusChange && issue.status !== 'resolved' && (
            <Button 
              size="sm" 
              onClick={() => onStatusChange('resolved')}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark Resolved
            </Button>
          )}
          {onStatusChange && issue.status === 'resolved' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange('closed')}
            >
              Close Issue
            </Button>
          )}
          {onPriorityChange && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onPriorityChange('high')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Escalate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueDetailsCard;
