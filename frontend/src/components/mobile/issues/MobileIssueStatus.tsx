
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types';

interface MobileIssueStatusProps {
  status: Issue['status'];
  priority: Issue['priority'];
}

const MobileIssueStatus: React.FC<MobileIssueStatusProps> = ({ status, priority }) => {
  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
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

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
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

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex gap-2">
      <Badge className={getStatusColor(status)}>
        {formatStatus(status)}
      </Badge>
      <Badge className={getPriorityColor(priority)}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    </div>
  );
};

export default MobileIssueStatus;
