
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

interface Issue {
  id: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

const MobileIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/issues/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      } else {
        throw new Error('Failed to fetch issues');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast({
        title: "Failed to load issues",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  if (loading) {
    return (
      <MobileLayout title="My Issues">
        <div className="p-4 text-center">Loading...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Issues">
      <div className="p-4 space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/mobile/issues/create')}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Issue
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
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
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No issues found</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/mobile/issues/create')}
                >
                  Create Your First Issue
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map((issue) => (
              <Card 
                key={issue.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/mobile/issues/${issue.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(issue.status)}
                      <span className="font-medium text-sm">
                        {issue.typeId.toUpperCase()}
                      </span>
                    </div>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
