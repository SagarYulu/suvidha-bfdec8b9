
import React from 'react';
import { Loader2, AlertTriangle, ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { useSentimentOverviewData } from './hooks/useSentimentOverviewData';
import EmptyDataState from '@/components/charts/EmptyDataState';
import MoodTrendSection from './MoodTrendSection';
import SentimentDistributionSection from './SentimentDistributionSection';
import TopicAnalysisSection from './TopicAnalysisSection';
import TopicDistributionSection from './TopicDistributionSection';
import ComparisonInsights from './ComparisonInsights';
import { ComparisonMode } from './ComparisonModeDropdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface SentimentOverviewProps {
  filters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
    comparisonMode?: ComparisonMode;
  };
}

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ filters }) => {
  const { 
    isLoading,
    isLoadingComparison,
    sentimentData,
    timeSeriesData,
    sentimentPieData,
    tagData,
    radarData,
    comparisonInsights,
    showComparison,
    hasPreviousPeriodData,
    comparisonLabel
  } = useSentimentOverviewData(filters);

  // Add debugging logs
  console.log("SentimentOverview state:", { 
    showComparison, 
    hasPreviousPeriodData,
    comparisonMode: filters.comparisonMode, 
    comparisonLabel,
    timeSeriesDataLength: timeSeriesData?.length || 0,
    sentimentData: sentimentData?.length || 0
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!sentimentData || sentimentData.length === 0) {
    return (
      <EmptyDataState 
        message="No sentiment data available for the selected filters."
        subMessage="Try clearing some filters or submitting feedback."
      />
    );
  }

  // Show warning when comparison is requested but no previous data exists
  const showNoPreviousDataWarning = filters.comparisonMode && 
                                    filters.comparisonMode !== 'none' && 
                                    !hasPreviousPeriodData;

  // Generate insights summary for display in the card
  const renderInsightSummary = () => {
    if (!showComparison || !comparisonInsights || comparisonInsights.length === 0) {
      return null;
    }

    return (
      <Card className="mb-6 bg-white border">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Key Comparison Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonInsights.map((insight, index) => {
              // Determine change icon and color
              let Icon = MinusIcon;
              let colorClass = "text-gray-600";
              
              if (insight.change > 0) {
                Icon = ArrowUpIcon;
                colorClass = insight.label.includes('Negative') ? "text-red-600" : "text-green-600";
              } else if (insight.change < 0) {
                Icon = ArrowDownIcon;
                colorClass = insight.label.includes('Negative') ? "text-green-600" : "text-red-600";
              }
              
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">{insight.label}</h4>
                  <div className="flex items-center mt-2 justify-between">
                    <span className="text-lg font-bold">{insight.value}</span>
                    <div className={`flex items-center ${colorClass}`}>
                      <Icon size={16} className="mr-1" />
                      <span className="text-sm font-medium">
                        {insight.change > 0 ? '+' : ''}{Math.abs(insight.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {/* Display key insights summary */}
      {renderInsightSummary()}

      {/* Show warning if comparison mode is selected but no previous data exists */}
      {showNoPreviousDataWarning && (
        <Alert variant="default" className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No data available for the previous {comparisonLabel} comparison period. 
            Only current period data will be shown.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Mood Trend Over Time */}
        <MoodTrendSection 
          data={timeSeriesData} 
          showComparison={showComparison} 
          comparisonLabel={comparisonLabel}
          hasPreviousPeriodData={hasPreviousPeriodData}
        />

        {/* Sentiment Distribution */}
        <SentimentDistributionSection 
          data={sentimentPieData} 
          showComparison={showComparison}
          comparisonLabel={comparisonLabel}
          hasPreviousPeriodData={hasPreviousPeriodData}
        />

        {/* Radar chart for top tags */}
        <TopicAnalysisSection 
          data={radarData} 
          showComparison={showComparison}
          comparisonLabel={comparisonLabel}
          hasPreviousPeriodData={hasPreviousPeriodData}
        />

        {/* Top Feedback Topics */}
        <TopicDistributionSection 
          data={tagData} 
          showComparison={showComparison}
          comparisonLabel={comparisonLabel}
          hasPreviousPeriodData={hasPreviousPeriodData}
        />
      </div>
    </div>
  );
};

export default SentimentOverview;
