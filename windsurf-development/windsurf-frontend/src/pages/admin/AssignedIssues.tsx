
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye,
  Edit,
  Clock,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssignedIssues: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for assigned issues
  const assignedIssues = [
    {
      id: 1,
      title: 'Login Authentication Issue',
      description: 'User unable to login with correct credentials',
      status: 'in_progress',
      priority: 'high',
      employee: 'John Doe',
      createdAt: '2024-01-15',
      assignedAt: '2024-01-15',
      dueDate: '2024-01-17'
    },
    {
      id: 2,
      title: 'Salary Discrepancy',
      description: 'Employee reporting incorrect salary calculation',
      status: 'open',
      priority: 'medium',
      employee: 'Jane Smith',
      createdAt: '2024-01-14',
      assignedAt: '2024-01-16',
      dueDate: '2024-01-20'
    },
    {
      id: 3,
      title: 'Leave Balance Error',
      description: 'Leave balance not updating after approval',
      status: 'pending_review',
      priority: 'low',
      employee: 'Mike Johnson',
      createdAt: '2024-01-13',
      assignedAt: '2024-01-14',
      dueDate: '2024-01-25'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredIssues = assignedIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <User className="h-8 w-8 mr-3 text-blue-600" />
          Issues Assigned to Me
        </h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {assignedIssues.length} Total Assigned
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {assignedIssues.filter(i => i.status === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {assignedIssues.filter(i => i.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {assignedIssues.filter(i => i.status === 'pending_review').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {assignedIssues.filter(i => getDaysUntilDue(i.dueDate) <= 3).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assigned issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_review">Pending Review</option>
              <option value="resolved">Resolved</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Issues ({filteredIssues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const daysUntilDue = getDaysUntilDue(issue.dueDate);
              return (
                <div 
                  key={issue.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/issues/${issue.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{issue.title}</h4>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By: {issue.employee}</span>
                      <span>Assigned: {issue.assignedAt}</span>
                      <span className={`flex items-center ${daysUntilDue <= 3 ? 'text-red-600' : ''}`}>
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {issue.dueDate} ({daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/issues/${issue.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No assigned issues found</p>
            <p className="text-sm text-gray-400 mt-1">
              Issues assigned to you will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignedIssues;
