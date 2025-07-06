
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';
import { Issue } from '@/types';
import { useToast } from '@/hooks/use-toast';
import IssueDetailsModal from '@/components/admin/issues/IssueDetailsModal';
import CreateIssueModal from '@/components/admin/issues/CreateIssueModal';

const Issues: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: issuesResponse, isLoading } = useQuery({
    queryKey: ['issues', statusFilter, priorityFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      
      const response = await ApiClient.get('/api/issues', { params });
      return response.data;
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: async (id: string) => {
      await ApiClient.delete(`/api/issues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete issue",
        variant: "destructive",
      });
    },
  });

  const issues = issuesResponse?.issues || [];
  
  const filteredIssues = issues.filter((issue: Issue) =>
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.emp_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.emp_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteIssueMutation.mutate(id);
    }
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowDetailsModal(true);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>
          <p className="text-gray-600">Track and manage all support issues</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issues List</CardTitle>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search issues, employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              {filteredIssues.map((issue: Issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-sm">
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
                  <TableCell>
                    <div className="text-sm">
                      <div>{issue.issue_type}</div>
                      <div className="text-gray-500">{issue.issue_subtype}</div>
                    </div>
                  </TableCell>
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(issue)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(issue.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['issues'] });
          }}
        />
      )}

      {showDetailsModal && selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIssue(null);
          }}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
          }}
        />
      )}
    </div>
  );
};

export default Issues;
