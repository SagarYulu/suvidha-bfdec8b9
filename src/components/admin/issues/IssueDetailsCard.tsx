
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types';
import { Clock, User, MapPin, AlertCircle } from 'lucide-react';

interface IssueDetailsCardProps {
  issue: Issue;
  status?: Issue["status"];
  handleStatusChange?: (newStatus: Issue["status"]) => Promise<void>;
  isUpdatingStatus?: boolean;
  formatDate?: (dateString: string) => string;
  getIssueTypeLabel?: (typeId: string) => string;
  getIssueSubTypeLabel?: (typeId: string, subTypeId: string) => string;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ 
  issue,
  status,
  handleStatusChange,
  isUpdatingStatus = false,
  formatDate,
  getIssueTypeLabel,
  getIssueSubTypeLabel
}) => {
  const formatDateDefault = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-orange-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIssueTypeLabelDefault = (typeId?: string) => {
    // Placeholder implementation
    return typeId || 'General Issue';
  };

  const getIssueSubTypeLabelDefault = (typeId?: string, subTypeId?: string) => {
    // Placeholder implementation
    return subTypeId || 'General';
  };

  const currentStatus = status || issue.status;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {getIssueTypeLabel ? getIssueTypeLabel(issue.typeId || '') : getIssueTypeLabelDefault(issue.typeId)}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getIssueSubTypeLabel ? getIssueSubTypeLabel(issue.typeId || '', issue.subTypeId || '') : getIssueSubTypeLabelDefault(issue.typeId, issue.subTypeId)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`text-white ${getStatusColor(currentStatus)}`}>
              {currentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={`text-white ${getPriorityColor(issue.priority)}`}>
              {issue.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Created: {formatDate ? formatDate(issue.createdAt) : formatDateDefault(issue.createdAt)}</span>
          </div>
          
          {issue.closedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Closed: {formatDate ? formatDate(issue.closedAt) : formatDateDefault(issue.closedAt)}</span>
            </div>
          )}
          
          {issue.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{issue.city}</span>
            </div>
          )}
          
          {issue.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Assigned to: {issue.assignedTo}</span>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>
        
        {issue.resolutionNotes && (
          <div>
            <h4 className="font-medium mb-2">Resolution Notes</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {issue.resolutionNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueDetailsCard;
