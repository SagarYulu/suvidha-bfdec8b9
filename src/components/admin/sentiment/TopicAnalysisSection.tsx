
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopicRadarChart from '@/components/charts/TopicRadarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface TopicAnalysisSectionProps {
  data: Array<{
    subject: string;
    count: number;
    fullMark: number;
  }>;
}

const TopicAnalysisSection: React.FC<TopicAnalysisSectionProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Feedback Topics</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <TopicRadarChart data={data} />
        ) : (
          <EmptyDataState message="No feedback topics available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default TopicAnalysisSection;
