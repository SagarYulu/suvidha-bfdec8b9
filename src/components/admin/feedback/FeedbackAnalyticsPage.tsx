
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackTrendChart from './FeedbackTrendChart';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';

const FeedbackAnalyticsPage: React.FC = () => {
  const {
    metrics,
    isLoading,
    filters,
    updateFilters
  } = useFeedbackAnalytics();

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    updateFilters({
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString()
    });
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    console.log('Exporting feedback analytics as:', format);
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Analytics</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FeedbackMetricsOverview 
            metrics={metrics}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackTrendChart 
                data={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Category analysis coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Sentiment analysis coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackAnalyticsPage;
