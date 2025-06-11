
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackTrendAnalysis from './FeedbackTrendAnalysis';
import FeedbackOptionBreakdown from './FeedbackOptionBreakdown';
import FeedbackFiltersPanel from './FeedbackFiltersPanel';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';

const FeedbackAnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    dateRange: { start: undefined, end: undefined },
    city: undefined,
    cluster: undefined,
    role: undefined
  });

  const { data, isLoading, error } = useFeedbackAnalytics(filters);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading feedback analytics: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackFiltersPanel filters={filters} onFiltersChange={setFilters} />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FeedbackMetricsOverview data={data?.overview} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="trends">
          <FeedbackTrendAnalysis data={data?.trends} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="breakdown">
          <FeedbackOptionBreakdown data={data?.breakdown} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackAnalyticsPage;
