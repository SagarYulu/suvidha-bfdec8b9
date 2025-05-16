
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SentimentPieChart from '@/components/charts/SentimentPieChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface SentimentDistributionSectionProps {
  data: Array<{
    name: string;
    value: number;
    previousValue?: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
}

const SentimentDistributionSection: React.FC<SentimentDistributionSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Overall Sentiment
          {showComparison && comparisonLabel && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Comparing: {comparisonLabel})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <SentimentPieChart data={data} showComparison={showComparison} />
        ) : (
          <EmptyDataState message="No sentiment distribution data available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionSection;
