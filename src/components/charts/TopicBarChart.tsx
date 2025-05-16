
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { labelFormatter } from './ChartUtils';

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ data }) => {
  // Define a formatter function that guarantees string or number return type
  const formatLabel = (value: any): string | number => {
    // Handle array case - extract first value and convert to string
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : '0';
    }
    // Handle non-array case - ensure string or number
    return typeof value === 'string' || typeof value === 'number' 
      ? value 
      : String(value || '0');
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            type="number" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} mentions`, "Mentions"]}
            labelFormatter={(label) => `Topic: ${label}`}
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb' 
            }}
          />
          <Bar 
            dataKey="count" 
            name="Times Mentioned"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(${210 - index * (150 / data.length)}, 80%, 55%)`} 
                radius={[0, 4, 4, 0]}
              />
            ))}
            <LabelList 
              dataKey="count" 
              position="right" 
              style={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }}
              offset={10} 
              formatter={formatLabel}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
