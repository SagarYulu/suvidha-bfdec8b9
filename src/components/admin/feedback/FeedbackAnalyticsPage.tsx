
import React, { useState } from 'react';
import FeedbackFiltersPanel from './FeedbackFiltersPanel';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackTrendAnalysis from './FeedbackTrendAnalysis';
import FeedbackOptionBreakdown from './FeedbackOptionBreakdown';
import FeedbackInsightsSummary from './FeedbackInsightsSummary';
import SentimentDistributionChart from './SentimentDistributionChart';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';
import EnhancedSunburstChart from './EnhancedSunburstChart';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const FeedbackAnalyticsPage = () => {
  const {
    isLoading,
    error,
    metrics,
    comparisonMetrics,
    filters,
    showComparison,
    updateFilters,
    toggleComparison,
    sunburstData
  } = useFeedbackAnalytics();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'options'>('overview');
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="font-semibold mb-2">Error Loading Data</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
  
  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading feedback analytics...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <FeedbackFiltersPanel 
        filters={filters}
        updateFilters={updateFilters}
        showComparison={showComparison}
        toggleComparison={toggleComparison}
      />
      
      <FeedbackInsightsSummary 
        currentMetrics={metrics} 
        previousMetrics={comparisonMetrics} 
        showComparison={showComparison} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackTrendAnalysis 
          metrics={metrics} 
          comparisonMetrics={comparisonMetrics}
          showComparison={showComparison}
          isLoading={isLoading}
        />
        
        <SentimentDistributionChart 
          currentData={metrics?.sentimentCounts} 
          previousData={comparisonMetrics?.sentimentCounts}
          showComparison={showComparison}
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackOptionBreakdown 
          data={metrics?.topOptions || []} 
          isLoading={isLoading} 
        />
        
        {/* Replace the old SunburstChart with our new EnhancedSunburstChart */}
        <EnhancedSunburstChart 
          data={sunburstData} 
          totalCount={metrics?.totalCount || 0} 
        />
      </div>
    </div>
  );
};

export default FeedbackAnalyticsPage;
