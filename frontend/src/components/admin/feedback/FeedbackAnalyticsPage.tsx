
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
import FeedbackFiltersPanel from './FeedbackFiltersPanel';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackInsightsSummary from './FeedbackInsightsSummary';
import SentimentDistributionChart from './SentimentDistributionChart';
import FeedbackSubmissionRate from './FeedbackSubmissionRate';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const FeedbackAnalyticsPage: React.FC = () => {
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="text-lg">Loading feedback data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading feedback data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Analytics</h1>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FeedbackFiltersPanel 
            onFiltersChange={() => {}}
            onComparisonToggle={setIsComparisonEnabled}
          />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <FeedbackMetricsOverview />
          
          {isComparisonEnabled && (
            <FeedbackInsightsSummary 
              insights={[]}
              showComparison={isComparisonEnabled}
            />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SentimentDistributionChart data={[]} />
            <FeedbackSubmissionRate 
              totalFeedback={0}
              totalClosedTickets={0}
              submissionRate={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalyticsPage;
