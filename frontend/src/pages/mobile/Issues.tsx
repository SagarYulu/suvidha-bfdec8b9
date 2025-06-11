
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IssueService } from '@/services/issueService';
import { Issue } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateRelative } from '@/lib/utils';
import { Plus, AlertCircle } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';

export default function MobileIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserIssues();
    }
  }, [user]);

  const loadUserIssues = async () => {
    try {
      if (!user) return;
      const data = await IssueService.getIssues({});
      // Filter issues for current user
      const userIssues = data.filter(issue => issue.employeeUuid === user.id);
      setIssues(userIssues);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="My Issues">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Issues">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">My Issues</h1>
          <Button onClick={() => navigate('/mobile/issues/new')} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Issue
          </Button>
        </div>

        {issues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any issues yet.</p>
              <Button onClick={() => navigate('/mobile/issues/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <Card 
                key={issue.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/mobile/issues/${issue.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight">
                      {issue.description.length > 80 
                        ? `${issue.description.substring(0, 80)}...` 
                        : issue.description
                      }
                    </h3>
                    <Badge className={`${getStatusColor(issue.status)} text-xs ml-2 flex-shrink-0`}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Priority: {issue.priority}</span>
                    <span>{formatDateRelative(issue.createdAt)}</span>
                  </div>
                  
                  {issue.comments.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      {issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
