
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Issue {
  id: string;
  description: string;
  status: string;
  priority: string;
  emp_name?: string;
  emp_code?: string;
  created_at: string;
  issue_type: string;
}

interface RecentTicketsTableProps {
  recentIssues: Issue[];
  isLoading: boolean;
}

const RecentTicketsTable: React.FC<RecentTicketsTableProps> = ({
  recentIssues,
  isLoading
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      case 'escalated': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-mono text-xs">
                  {issue.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{issue.emp_name}</div>
                    <div className="text-sm text-gray-500">{issue.emp_code}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {issue.description}
                </TableCell>
                <TableCell>{issue.issue_type}</TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(issue.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentTicketsTable;
