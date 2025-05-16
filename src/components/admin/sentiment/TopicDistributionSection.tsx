
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopicBarChart from '@/components/charts/TopicBarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface TopicDistributionSectionProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const TopicDistributionSection: React.FC<TopicDistributionSectionProps> = ({ data }) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Topic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyDataState 
            message="No feedback topics available for the selected filters."
            subMessage="Try clearing some filters or submitting more detailed feedback."
          />
        ) : (
          <TopicBarChart data={data} />
        )}
      </CardContent>
    </Card>
  );
};

export default TopicDistributionSection;
