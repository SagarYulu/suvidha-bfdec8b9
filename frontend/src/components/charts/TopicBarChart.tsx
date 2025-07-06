
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ data, showComparison = false }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#2563eb" name="Current Period" />
          {showComparison && (
            <Bar dataKey="previousCount" fill="#64748b" name="Previous Period" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
