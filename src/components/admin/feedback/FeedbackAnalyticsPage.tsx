
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

  // Generate insights for the FeedbackInsightsSummary component
  const generateInsights = () => {
    if (!metrics || !comparisonMetrics) return [];
    
    // Convert to the format expected by FeedbackInsightsSummary
    return [
      {
        label: 'Happiness Score',
        value: `${metrics.happinessScore.toFixed(1)}%`,
        change: calculatePercentChange(metrics.happinessScore, comparisonMetrics.happinessScore)
      },
      {
        label: 'Response Rate',
        value: `${metrics.responseRate.toFixed(1)}%`,
        change: calculatePercentChange(metrics.responseRate, comparisonMetrics.responseRate)
      },
      {
        label: 'Negative Feedback',
        value: `${metrics.sentimentCounts.sad || 0}`,
        change: calculatePercentChange(
          metrics.sentimentCounts.sad || 0, 
          comparisonMetrics.sentimentCounts.sad || 0
        )
      },
      {
        label: 'Average Resolution Time',
        value: `${metrics.avgResolutionTime || 0} hrs`,
        change: calculatePercentChange(
          metrics.avgResolutionTime || 0, 
          comparisonMetrics.avgResolutionTime || 0
        )
      }
    ];
  };
  
  // Helper function to calculate percent change
  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  return (
    <div className="space-y-6 p-6">
      <FeedbackFiltersPanel 
        filters={filters}
        onFilterChange={updateFilters}
        isComparisonEnabled={showComparison}
        onComparisonToggle={toggleComparison}
      />
      
      <FeedbackInsightsSummary 
        insights={generateInsights()} 
        showComparison={showComparison} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackTrendAnalysis 
          data={metrics?.trendData || []} 
          showComparison={showComparison}
        />
        
        <SentimentDistributionChart 
          data={metrics?.trendData || []} 
          showComparison={showComparison}
          title="Sentiment Distribution Over Time"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackOptionBreakdown 
          options={metrics?.topOptions || []} 
          showComparison={showComparison} 
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
