
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopicRadarChart from '@/components/charts/TopicRadarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface TopicAnalysisSectionProps {
  data: Array<{
    subject: string;
    count: number;
    previousCount?: number;
    fullMark: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
}

const TopicAnalysisSection: React.FC<TopicAnalysisSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Top Feedback Topics
          {showComparison && comparisonLabel && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Comparing: {comparisonLabel})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <TopicRadarChart data={data} showComparison={showComparison} />
        ) : (
          <EmptyDataState message="No feedback topics available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default TopicAnalysisSection;
