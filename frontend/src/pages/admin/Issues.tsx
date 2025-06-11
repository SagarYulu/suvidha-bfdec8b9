
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IssueService } from '@/services/issueService';
import { Issue } from '@/types';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';

const Issues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadIssues();
  }, [statusFilter]);

  const loadIssues = async () => {
    try {
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await IssueService.getIssues(filters);
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="text-gray-600">Manage and track all customer issues</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6" onClick={() => navigate(`/admin/issues/${issue.id}`)}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {issue.description.length > 100 
                      ? `${issue.description.substring(0, 100)}...` 
                      : issue.description
                    }
                  </h3>
                  <div className="text-sm text-gray-600">
                    Employee: {issue.employee?.name || 'Unknown'} • 
                    Created: {formatDate(issue.createdAt)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
              </div>
              
              {issue.assignedTo && (
                <div className="text-sm text-gray-600">
                  Assigned to: {issue.assignedTo}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No issues found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Issues;
