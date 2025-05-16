
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSentimentOverviewData } from './hooks/useSentimentOverviewData';
import EmptyDataState from '@/components/charts/EmptyDataState';
import MoodTrendSection from './MoodTrendSection';
import SentimentDistributionSection from './SentimentDistributionSection';
import TopicAnalysisSection from './TopicAnalysisSection';
import TopicDistributionSection from './TopicDistributionSection';

interface SentimentOverviewProps {
  filters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  };
}

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ filters }) => {
  const { 
    isLoading,
    sentimentData,
    timeSeriesData,
    sentimentPieData,
    tagData,
    radarData
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Mood Trend Over Time */}
      <MoodTrendSection data={timeSeriesData} />

      {/* Sentiment Distribution */}
      <SentimentDistributionSection data={sentimentPieData} />

      {/* Radar chart for top tags */}
      <TopicAnalysisSection data={radarData} />

      {/* Top Feedback Topics */}
      <TopicDistributionSection data={tagData} />
    </div>
  );
};

export default SentimentOverview;
