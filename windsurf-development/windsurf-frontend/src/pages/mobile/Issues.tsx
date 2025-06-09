
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MobileIssues: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: issues, isLoading } = useIssues({ 
    employeeUuid: user?.id 
  });

  if (isLoading) return <div>Loading issues...</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Issues</h1>
        <Button onClick={() => navigate('/mobile/create-issue')}>
          Create Issue
        </Button>
      </div>
      
      <div className="space-y-4">
        {issues?.data?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No issues found</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/mobile/create-issue')}
              >
                Create Your First Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          issues?.data?.map((issue: any) => (
            <Card key={issue.id}>
              <CardHeader>
                <CardTitle className="text-lg">{issue.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span> {issue.status}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> {issue.priority}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(issue.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileIssues;
