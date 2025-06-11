
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types';
import { Clock, User, MapPin, AlertCircle } from 'lucide-react';

interface IssueDetailsCardProps {
  issue: Issue;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ issue }) => {
  const formatDate = (dateString: string) => {
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

  const getIssueTypeLabel = (typeId?: string) => {
    // Placeholder implementation
    return typeId || 'General Issue';
  };

  const getIssueSubTypeLabel = (typeId?: string, subTypeId?: string) => {
    // Placeholder implementation
    return subTypeId || 'General';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {getIssueTypeLabel(issue.typeId)}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`text-white ${getStatusColor(issue.status)}`}>
              {issue.status.replace('_', ' ').toUpperCase()}
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
            <span className="text-sm">Created: {formatDate(issue.createdAt)}</span>
          </div>
          
          {issue.closedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Closed: {formatDate(issue.closedAt)}</span>
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
