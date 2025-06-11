
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from './ChartUtils';

interface MoodTrendChartProps {
  data: Array<{
    date: string;
    rating: number;
    previousRating?: number;
    count?: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  const formatTooltip = (value: any, name: string) => {
    if (name === 'rating' || name === 'previousRating') {
      return [`${Number(value).toFixed(1)}`, name === 'rating' ? 'Current Rating' : 'Previous Rating'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    return formatDate(tickItem, 'MMM dd');
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[1, 5]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Current Period"
            dot={{ r: 4 }}
          />
          {showComparison && (
            <Line 
              type="monotone" 
              dataKey="previousRating" 
              stroke="#94A3B8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Previous Period"
              dot={{ r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrendChart;
