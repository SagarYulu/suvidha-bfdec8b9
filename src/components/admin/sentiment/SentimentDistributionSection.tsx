
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SentimentPieChart from '@/components/charts/SentimentPieChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface SentimentDistributionSectionProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const SentimentDistributionSection: React.FC<SentimentDistributionSectionProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <SentimentPieChart data={data} />
        ) : (
          <EmptyDataState message="No sentiment distribution data available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionSection;
