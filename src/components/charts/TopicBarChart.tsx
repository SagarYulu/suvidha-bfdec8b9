
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

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ data }) => {
  // Define a more specific formatter function for this component
  // This formatter must return string | number to satisfy LabelList's type constraints
  const formatLabel = (value: any): string | number => {
    // If it's an array, convert the first value to string
    if (Array.isArray(value)) {
      return String(value[0] || 0);
    }
    // If it's already a string or number, return as is, otherwise convert to string
    return typeof value === 'string' || typeof value === 'number' 
      ? value 
      : String(value);
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
