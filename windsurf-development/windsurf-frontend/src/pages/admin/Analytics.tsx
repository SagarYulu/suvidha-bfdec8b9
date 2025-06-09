
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
