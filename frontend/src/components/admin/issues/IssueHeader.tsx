
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IssueHeaderProps {
  issueId: string;
  title?: string;
  status: string;
  priority: string;
  onEdit?: () => void;
  canEdit?: boolean;
}

const IssueHeader: React.FC<IssueHeaderProps> = ({
  issueId,
  title,
  status,
  priority,
  onEdit,
  canEdit = false
}) => {
  const navigate = useNavigate();

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
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/issues')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold">
              {title || `Issue #${issueId}`}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(status)}>
                {status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(priority)}>
                {priority.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">ID: {issueId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Issue
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueHeader;
