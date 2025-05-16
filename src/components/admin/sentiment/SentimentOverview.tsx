
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSentimentOverviewData } from './hooks/useSentimentOverviewData';
import EmptyDataState from '@/components/charts/EmptyDataState';
import MoodTrendSection from './MoodTrendSection';
import SentimentDistributionSection from './SentimentDistributionSection';
import TopicAnalysisSection from './TopicAnalysisSection';
import TopicDistributionSection from './TopicDistributionSection';
import ComparisonInsights from './ComparisonInsights';
import { ComparisonMode } from './ComparisonModeDropdown';

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

  return (
    <div>
      {/* Display comparison insights if available */}
      {showComparison && comparisonInsights && comparisonInsights.length > 0 && (
        <ComparisonInsights 
          insights={comparisonInsights} 
          isLoading={isLoadingComparison} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Mood Trend Over Time */}
        <MoodTrendSection 
          data={timeSeriesData} 
          showComparison={showComparison} 
          comparisonLabel={comparisonLabel}
        />

        {/* Sentiment Distribution */}
        <SentimentDistributionSection 
          data={sentimentPieData} 
          showComparison={showComparison}
          comparisonLabel={comparisonLabel} 
        />

        {/* Radar chart for top tags */}
        <TopicAnalysisSection 
          data={radarData} 
          showComparison={showComparison}
          comparisonLabel={comparisonLabel}
        />

        {/* Top Feedback Topics */}
        <TopicDistributionSection 
          data={tagData} 
          showComparison={showComparison}
          comparisonLabel={comparisonLabel}
        />
      </div>
    </div>
  );
};

export default SentimentOverview;
