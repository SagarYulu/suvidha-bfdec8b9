
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MoodTrendChartProps {
  data: Array<{
    date: string;
    rating: number;
    previousRating?: number;
  }>;
  showComparison?: boolean;
}

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data, showComparison = false }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis domain={[1, 5]} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value.toFixed(1), 'Rating']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Current Period"
          />
          {showComparison && (
            <Line 
              type="monotone" 
              dataKey="previousRating" 
              stroke="#64748b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Previous Period"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrendChart;
