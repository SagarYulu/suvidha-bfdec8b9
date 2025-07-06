
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackTrendChart from './FeedbackTrendChart';
import FeedbackSubmissionRate from './FeedbackSubmissionRate';

interface TrendData {
  daily: any[];
  weekly: any[];
  monthly: any[];
  submissionRate: any[];
}

interface FeedbackTrendAnalysisProps {
  data: TrendData | undefined;
  isLoading?: boolean;
}

const FeedbackTrendAnalysis: React.FC<FeedbackTrendAnalysisProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No trend data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <FeedbackTrendChart 
            data={data.daily} 
            title="Daily Feedback Trends"
            period="daily"
          />
        </TabsContent>
        
        <TabsContent value="weekly">
          <FeedbackTrendChart 
            data={data.weekly} 
            title="Weekly Feedback Trends"
            period="weekly"
          />
        </TabsContent>
        
        <TabsContent value="monthly">
          <FeedbackTrendChart 
            data={data.monthly} 
            title="Monthly Feedback Trends"
            period="monthly"
          />
        </TabsContent>
      </Tabs>

      <FeedbackSubmissionRate data={data.submissionRate} />
    </div>
  );
};

export default FeedbackTrendAnalysis;
