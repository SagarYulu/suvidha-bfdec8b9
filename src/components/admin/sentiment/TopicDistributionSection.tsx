
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopicBarChart from '@/components/charts/TopicBarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface TopicDistributionSectionProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
}

const TopicDistributionSection: React.FC<TopicDistributionSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel
}) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>
          Topic Distribution
          {showComparison && comparisonLabel && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Comparing: {comparisonLabel})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyDataState 
            message="No feedback topics available for the selected filters."
            subMessage="Try clearing some filters or submitting more detailed feedback."
          />
        ) : (
          <TopicBarChart data={data} showComparison={showComparison} />
        )}
      </CardContent>
    </Card>
  );
};

export default TopicDistributionSection;
