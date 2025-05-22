
import React, { useState, useEffect } from 'react';
import AdminLayout from "@/components/AdminLayout";
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import FeedbackFiltersPanel from './FeedbackFiltersPanel';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackTrendChart from './FeedbackTrendChart';
import FeedbackOptionBreakdown from './FeedbackOptionBreakdown';
import FeedbackInsightsSummary from './FeedbackInsightsSummary';
import SentimentDistributionChart from './SentimentDistributionChart';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FeedbackAnalyticsPage: React.FC = () => {
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    isLoading,
    error,
    metrics,
    comparisonMetrics,
    rawData,
    filters,
    updateFilters,
    toggleComparison
  } = useFeedbackAnalytics();
  
  // Mark as initialized after first load
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);
  
  // Handle comparison toggle
  const handleComparisonToggle = (enabled: boolean) => {
    setIsComparisonEnabled(enabled);
    toggleComparison(enabled);
  };
  
  const renderContent = () => {
    if (isLoading && !isInitialized) {
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
            Error loading feedback data: {error.message}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!metrics || metrics.totalCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-lg shadow p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium">No feedback data available</h3>
          <p className="text-muted-foreground mt-2">
            Try changing your filters or check if feedback has been submitted for the selected period.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Insights Summary */}
        <FeedbackInsightsSummary 
          insights={metrics.insightData || []}
          showComparison={isComparisonEnabled}
        />
        
        {/* Metrics Overview */}
        <FeedbackMetricsOverview 
          metrics={metrics} 
          comparisonMetrics={isComparisonEnabled ? comparisonMetrics : null}
          comparisonMode={isComparisonEnabled ? filters.comparisonMode : 'none'}
        />
        
        {/* Sentiment Distribution Chart - Only show this one, removed duplicate */}
        <SentimentDistributionChart 
          data={metrics.trendData} 
          showComparison={isComparisonEnabled}
          title="Sentiment Distribution Over Time"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <FeedbackTrendChart 
            data={metrics.trendData} 
            showComparison={isComparisonEnabled}
            comparisonMode={filters.comparisonMode}
          />
          
          {/* Feedback Option Breakdown */}
          <FeedbackOptionBreakdown 
            options={metrics.topOptions}
            showComparison={isComparisonEnabled}
          />
        </div>
      </div>
    );
  };
  
  return (
    <AdminLayout title="Feedback Analytics">
      <div className="space-y-6">
        {/* Filters Panel */}
        <FeedbackFiltersPanel 
          filters={filters}
          onFilterChange={updateFilters}
          isComparisonEnabled={isComparisonEnabled}
          onComparisonToggle={handleComparisonToggle}
        />
        
        {/* Loading state overlay for subsequent data loads */}
        <div className="relative">
          {isLoading && isInitialized && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-lg shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="font-medium">Updating data...</span>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbackAnalyticsPage;
