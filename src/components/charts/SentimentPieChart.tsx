
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { SENTIMENT_COLORS, CHART_COLORS } from './ChartUtils';

interface SentimentPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const SentimentPieChart: React.FC<SentimentPieChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
            labelLine={{ strokeWidth: 1, stroke: '#9CA3AF' }}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.name.toLowerCase() === 'positive' ? SENTIMENT_COLORS.positive :
                  entry.name.toLowerCase() === 'negative' ? SENTIMENT_COLORS.negative :
                  entry.name.toLowerCase() === 'neutral' ? SENTIMENT_COLORS.neutral :
                  CHART_COLORS[index % CHART_COLORS.length]
                } 
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} responses`, `${value} responses`]} 
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb' 
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentPieChart;
