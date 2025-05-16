
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useSentimentOverviewData } from './hooks/useSentimentOverviewData';
import EmptyDataState from '@/components/charts/EmptyDataState';
import MoodTrendSection from './MoodTrendSection';
import SentimentDistributionSection from './SentimentDistributionSection';
import TopicAnalysisSection from './TopicAnalysisSection';
import TopicDistributionSection from './TopicDistributionSection';
import ComparisonInsights from './ComparisonInsights';
import { ComparisonMode } from './ComparisonModeDropdown';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  return (
    <div>
      {/* Display comparison insights if available */}
      {showComparison && comparisonInsights && comparisonInsights.length > 0 && (
        <ComparisonInsights 
          insights={comparisonInsights} 
          isLoading={isLoadingComparison} 
        />
      )}

      {/* Show warning if comparison mode is selected but no previous data exists */}
      {showNoPreviousDataWarning && (
        <Alert variant="warning" className="mb-6">
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
