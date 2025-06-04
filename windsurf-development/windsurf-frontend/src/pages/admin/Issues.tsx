
import React, { useState } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";

const Issues: React.FC = () => {
  const { hasPermission } = useRBAC();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  if (!hasPermission('manage_issues')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to manage issues.</p>
        </div>
      </div>
    );
  }

  // Mock data for now
  const mockIssues = [
    {
      id: 'ISS-001',
      title: 'Payment Issue',
      description: 'Unable to receive payment for last month',
      status: 'open',
      priority: 'high',
      createdBy: 'John Doe',
      assignedTo: 'Support Team',
      createdAt: '2024-01-15',
      category: 'Financial'
    },
    {
      id: 'ISS-002',
      title: 'Vehicle Maintenance',
      description: 'Bike needs urgent maintenance',
      status: 'in_progress',
      priority: 'medium',
      createdBy: 'Jane Smith',
      assignedTo: 'Maintenance Team',
      createdAt: '2024-01-14',
      category: 'Operations'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.open;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      urgent: 'bg-purple-100 text-purple-800'
    };
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="grid gap-4">
        {mockIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{issue.title}</h3>
                    <Badge variant="outline">{issue.id}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{issue.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created by: {issue.createdBy}</span>
                    <span>Assigned to: {issue.assignedTo}</span>
                    <span>Created: {issue.createdAt}</span>
                    <span>Category: {issue.category}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <Badge className={getStatusBadge(issue.status)}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityBadge(issue.priority)}>
                      {issue.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Issues;
