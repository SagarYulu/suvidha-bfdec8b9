
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getColorByIndex } from './ChartUtils';

interface SentimentPieChartProps {
  data: Array<{
    name: string;
    value: number;
    previousValue?: number;
  }>;
  showComparison?: boolean;
}

const SentimentPieChart: React.FC<SentimentPieChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  const SENTIMENT_COLORS = {
    'Positive': '#10B981',
    'Negative': '#EF4444', 
    'Neutral': '#6B7280',
    'Unknown': '#9CA3AF'
  };

  const getColor = (name: string, index: number) => {
    return SENTIMENT_COLORS[name as keyof typeof SENTIMENT_COLORS] || getColorByIndex(index);
  };

  const renderLabel = ({ name, percent }: any) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(entry.name, index)} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentPieChart;
