
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreHorizontal } from 'lucide-react';
import { Issue } from '@/types';

interface IssueHeaderProps {
  issue: Issue;
  onBack?: () => void;
  onEdit?: () => void;
  showBackButton?: boolean;
}

const IssueHeader: React.FC<IssueHeaderProps> = ({
  issue,
  onBack,
  onEdit,
  showBackButton = true
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold">
                Issue #{issue.id.slice(-8)}
              </h1>
              <p className="text-sm text-gray-600">
                Created {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(issue.status)}>
              {issue.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(issue.priority)}>
              {issue.priority}
            </Badge>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium">{issue.typeLabel || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-500">Sub Type:</span>
            <span className="ml-2 font-medium">{issue.subTypeLabel || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-500">Assigned:</span>
            <span className="ml-2 font-medium">{issue.assignedTo || 'Unassigned'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueHeader;
