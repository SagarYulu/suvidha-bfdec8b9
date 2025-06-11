
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: string;
  issueType: string;
}

interface RecentTicketsTableProps {
  recentIssues: Issue[];
  isLoading: boolean;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
    case 'new':
      return 'default';
    case 'in_progress':
    case 'assigned':
      return 'secondary';
    case 'resolved':
    case 'closed':
      return 'default';
    default:
      return 'outline';
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

const RecentTicketsTable: React.FC<RecentTicketsTableProps> = ({ recentIssues, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {recentIssues.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-sm">
                    {issue.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {issue.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{issue.issueType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {issue.assignedTo || 'Unassigned'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No recent tickets to display
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTicketsTable;
