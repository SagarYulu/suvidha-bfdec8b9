
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MoodTrendChart from '@/components/charts/MoodTrendChart';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface MoodTrendSectionProps {
  data: Array<{
    date: string;
    rating: number;
    count: number;
  }>;
}

const MoodTrendSection: React.FC<MoodTrendSectionProps> = ({ data }) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Employee Mood Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <MoodTrendChart data={data} />
        ) : (
          <EmptyDataState message="No mood trend data available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default MoodTrendSection;
