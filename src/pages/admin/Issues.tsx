
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Filter } from 'lucide-react';
import { getIssues } from '@/services/issues/issueFilters';
import { updateAllIssuePriorities } from '@/services/issues/priorityUpdateService';
import { Issue } from '@/types';

const Issues: React.FC = () => {
  const [filters, setFilters] = useState({
    city: '',
    cluster: '',
    issueType: ''
  });

  const { data: issues = [], isLoading, error } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => getIssues(filters),
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleBulkPriorityUpdate = async () => {
    console.log('Starting bulk priority update...');
    const result = await updateAllIssuePriorities();
    console.log('Bulk update result:', result);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Issues">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Issues">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading issues. Please try again.</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Issue Management">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">All Issues</Button>
              <Button variant="outline" size="sm">Open</Button>
              <Button variant="outline" size="sm">In Progress</Button>
              <Button variant="outline" size="sm">Resolved</Button>
              <Button onClick={handleBulkPriorityUpdate} variant="outline" size="sm">
                Update Priorities
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Issues ({issues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue: Issue) => (
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
                      <TableCell>{issue.employeeId}</TableCell>
                      <TableCell>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/issues/${issue.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No issues found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Issues;
