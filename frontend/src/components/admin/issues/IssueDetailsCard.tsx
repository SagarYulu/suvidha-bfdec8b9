
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types';

interface IssueDetailsCardProps {
  issue: Issue;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ issue }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Issue Details</span>
          <div className="flex space-x-2">
            <Badge className={`text-white ${getStatusColor(issue.status)}`}>
              {issue.status.replace('_', ' ')}
            </Badge>
            <Badge className={`text-white ${getPriorityColor(issue.priority)}`}>
              {issue.priority}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{issue.title}</h3>
          <p className="text-gray-600 mt-2">{issue.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Issue Type</label>
            <p className="text-sm">{issue.issueType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Employee ID</label>
            <p className="text-sm">{issue.employeeId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">City</label>
            <p className="text-sm">{issue.city || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Cluster</label>
            <p className="text-sm">{issue.cluster || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-sm">{new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Assigned To</label>
            <p className="text-sm">{issue.assignedTo || 'Unassigned'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueDetailsCard;
