
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { truncateText } from './ChartUtils';

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  const formatXAxisLabel = (tickItem: string) => {
    return truncateText(tickItem, 15);
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="count" 
            fill="#3B82F6" 
            name="Current Period"
          />
          {showComparison && (
            <Bar 
              dataKey="previousCount" 
              fill="#94A3B8" 
              name="Previous Period"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
