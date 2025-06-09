
import React from 'react';
import { useIssues } from '@/hooks/useIssues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminIssues: React.FC = () => {
  const { data: issues, isLoading, error } = useIssues();

  if (isLoading) return <div>Loading issues...</div>;
  if (error) return <div>Error loading issues</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Issues Management</h1>
      
      <div className="space-y-4">
        {issues?.data?.map((issue: any) => (
          <Card key={issue.id}>
            <CardHeader>
              <CardTitle className="text-lg">{issue.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span> {issue.status}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {issue.priority}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(issue.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Employee:</span> {issue.employee_name || 'Unknown'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminIssues;
