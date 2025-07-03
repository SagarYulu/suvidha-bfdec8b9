
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopicRadarChart from '@/components/charts/TopicRadarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { AlertTriangle } from 'lucide-react';

interface TopicAnalysisSectionProps {
  data: Array<{
    subject: string;
    count: number;
    previousCount?: number;
    fullMark: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
  hasPreviousPeriodData?: boolean;
}

const TopicAnalysisSection: React.FC<TopicAnalysisSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel,
  hasPreviousPeriodData = true
}) => {
  const showComparisonData = showComparison && hasPreviousPeriodData;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Top Feedback Topics
            {showComparison && comparisonLabel && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Comparing: {comparisonLabel})
              </span>
            )}
          </span>
          
          {showComparison && !hasPreviousPeriodData && (
            <span className="text-amber-500 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              No previous period data
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <TopicRadarChart data={data} showComparison={showComparisonData} />
        ) : (
          <EmptyDataState message="No feedback topics available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default TopicAnalysisSection;
