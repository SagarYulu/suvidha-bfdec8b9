
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import SentimentOverview from '@/components/admin/sentiment/SentimentOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SentimentDashboard: React.FC = () => {
  return (
    <AdminLayout title="Sentiment Dashboard">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentOverview filters={{}} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SentimentDashboard;
