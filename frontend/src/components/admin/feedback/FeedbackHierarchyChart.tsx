
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface HierarchyData {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface FeedbackHierarchyChartProps {
  data: HierarchyData[];
  totalCount: number;
}

const FeedbackHierarchyChart: React.FC<FeedbackHierarchyChartProps> = ({
  data,
  totalCount
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDataState message="No feedback data available by category." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="positive" stackId="a" fill="#10B981" name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill="#F59E0B" name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackHierarchyChart;
