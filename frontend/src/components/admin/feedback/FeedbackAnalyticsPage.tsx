
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackSubmissionRate from './FeedbackSubmissionRate';
import FeedbackTrendAnalysis from './FeedbackTrendAnalysis';
import SentimentDistributionChart from './SentimentDistributionChart';
import FeedbackOptionBreakdown from './FeedbackOptionBreakdown';
import FeedbackInsightsSummary from './FeedbackInsightsSummary';

const FeedbackAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const mockInsights = [
    { label: 'Avg Rating', value: '4.2', change: 0.3 },
    { label: 'Response Rate', value: '85%', change: 5 },
    { label: 'Positive Sentiment', value: '76%', change: -2 },
    { label: 'Resolution Score', value: '3.8', change: 0.1 }
  ];

  const mockSentimentData = [
    { sentiment: 'happy', count: 150, percentage: 65 },
    { sentiment: 'neutral', count: 50, percentage: 22 },
    { sentiment: 'sad', count: 30, percentage: 13 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feedback Analytics</h1>
        <select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <FeedbackMetricsOverview />

      <FeedbackInsightsSummary insights={mockInsights} showComparison={true} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeedbackSubmissionRate 
              totalFeedback={230}
              totalClosedTickets={280}
              submissionRate={82.1}
            />
            <SentimentDistributionChart data={mockSentimentData} />
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <SentimentDistributionChart data={mockSentimentData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <FeedbackTrendAnalysis data={[]} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <FeedbackOptionBreakdown options={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackAnalyticsPage;
