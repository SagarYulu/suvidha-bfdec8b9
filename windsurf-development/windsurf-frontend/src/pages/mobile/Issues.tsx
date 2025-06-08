
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileIssues: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Mock data - in real implementation, this would come from API
  const issues = [
    {
      id: 1,
      title: 'Login Problem',
      description: 'Cannot access my account',
      status: 'open',
      priority: 'high',
      createdAt: '2024-01-15',
      type: 'technical'
    },
    {
      id: 2,
      title: 'Salary Query',
      description: 'Question about last month salary',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-14',
      type: 'hr'
    },
    {
      id: 3,
      title: 'Leave Application',
      description: 'Need to apply for emergency leave',
      status: 'in_progress',
      priority: 'low',
      createdAt: '2024-01-13',
      type: 'hr'
    }
  ];

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
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === filter);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Issues</h1>
        <Button 
          size="sm"
          onClick={() => navigate('/mobile/new-issue')}
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'open', 'in_progress', 'resolved'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="whitespace-nowrap"
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.map((issue) => (
          <Card 
            key={issue.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/mobile/issues/${issue.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm">{issue.title}</h3>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {issue.createdAt}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No issues found</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/mobile/new-issue')}
            >
              Create your first issue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileIssues;
