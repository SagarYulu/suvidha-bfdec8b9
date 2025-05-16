
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ data }) => {
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
            label={{ value: 'Number of Mentions', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            width={75}
            tickFormatter={(value) => {
              // Ensure labels don't get too long
              return value.length > 12 ? `${value.substring(0, 10)}...` : value;
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} mentions`, "Mentions"]}
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb' 
            }}
          />
          {data.map((entry, index) => (
            <Bar 
              key={`bar-${index}`}
              dataKey="count"
              fill={`hsl(${210 - index * (150 / Math.max(data.length, 1))}, 80%, 55%)`}
              name={entry.name}
              background={{ fill: '#eee' }}
            >
              {data.map((_, i) => (
                <Cell 
                  key={`cell-${i}`} 
                  fill={`hsl(${210 - i * (150 / Math.max(data.length, 1))}, 80%, 55%)`} 
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
