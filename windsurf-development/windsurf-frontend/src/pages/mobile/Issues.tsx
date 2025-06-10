
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdated: string;
}

const MobileIssues: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockIssues: Issue[] = [
      {
        id: '1',
        title: 'Login Issues',
        description: 'Unable to log into the system',
        status: 'in-progress',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        lastUpdated: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        title: 'Password Reset',
        description: 'Need to reset password',
        status: 'resolved',
        priority: 'medium',
        createdAt: '2024-01-14T09:00:00Z',
        lastUpdated: '2024-01-14T15:00:00Z'
      },
      {
        id: '3',
        title: 'App Crash',
        description: 'Mobile app crashes on startup',
        status: 'open',
        priority: 'urgent',
        createdAt: '2024-01-13T16:45:00Z',
        lastUpdated: '2024-01-13T16:45:00Z'
      }
    ];

    setTimeout(() => {
      setIssues(mockIssues);
      setFilteredIssues(mockIssues);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const rightAction = (
    <Button
      size="sm"
      onClick={() => navigate('/mobile/new-issue')}
      className="bg-white text-blue-600 hover:bg-blue-50"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );

  return (
    <MobileLayout title="My Issues" showBackButton={false} rightAction={rightAction}>
      <div className="p-4 space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('open')}
            >
              Open
            </Button>
            <Button
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in-progress')}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Issues List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No issues found</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/mobile/new-issue')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Issue
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {filteredIssues.map((issue) => (
              <Card 
                key={issue.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/mobile/issues/${issue.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{issue.title}</h3>
                    <Badge className={getStatusColor(issue.status)}>
                      {getStatusIcon(issue.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(issue.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
