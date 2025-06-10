
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  type: string;
}

export const MobileIssues: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, selectedFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      const mockIssues: Issue[] = [
        {
          id: '1',
          title: 'Salary Clarification Required',
          description: 'Need clarification on overtime calculation',
          status: 'open',
          priority: 'medium',
          created_at: '2024-01-15T10:30:00Z',
          type: 'Payroll'
        },
        {
          id: '2',
          title: 'Leave Application Issue',
          description: 'Unable to submit annual leave request',
          status: 'pending',
          priority: 'low',
          created_at: '2024-01-14T15:45:00Z',
          type: 'Leave Management'
        },
        {
          id: '3',
          title: 'Performance Review Query',
          description: 'Questions about performance evaluation process',
          status: 'resolved',
          priority: 'high',
          created_at: '2024-01-13T09:15:00Z',
          type: 'Performance'
        },
        {
          id: '4',
          title: 'Training Schedule Conflict',
          description: 'Conflict with mandatory training schedule',
          status: 'closed',
          priority: 'medium',
          created_at: '2024-01-12T14:20:00Z',
          type: 'Training'
        }
      ];
      
      setIssues(mockIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    let filtered = issues;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === selectedFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Issues' },
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/mobile/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">My Issues</h1>
          </div>
          <Button 
            size="sm"
            onClick={() => navigate('/mobile/issues/new')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedFilter === option.value ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading issues...</div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              {searchTerm || selectedFilter !== 'all' 
                ? 'No issues match your filters' 
                : 'No issues found'
              }
            </div>
            <Button onClick={() => navigate('/mobile/issues/new')}>
              Create Your First Issue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card 
                key={issue.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/mobile/issues/${issue.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex-1 pr-2">
                      {issue.title}
                    </h3>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                      <span className="text-gray-500">{issue.type}</span>
                    </div>
                    <span className="text-gray-500">
                      {formatDate(issue.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  );
};

export default MobileIssues;
