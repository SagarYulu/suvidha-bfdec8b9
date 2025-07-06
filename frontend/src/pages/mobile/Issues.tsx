
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layouts/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageCircle } from 'lucide-react';
import { Issue } from '@/types';
import { ApiClient } from '@/services/apiClient';
import { Link } from 'react-router-dom';

const MobileIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserIssues();
  }, []);

  const fetchUserIssues = async () => {
    try {
      const response = await ApiClient.get('/api/issues/my-issues');
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="My Issues">
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-24 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Issues">
      <div className="p-4">
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600">You haven't created any issues yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Link key={issue.id} to={`/mobile/issues/${issue.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 truncate flex-1">
                        {issue.description.substring(0, 60)}...
                      </h3>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {/* Comments count would go here */}
                        0 comments
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssuesPage;
