
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
          margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Number of Mentions', position: 'insideLeft', angle: -90, dy: 50, dx: -10, style: { textAnchor: 'middle' } }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} mentions`, "Mentions"]}
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb' 
            }}
          />
          <Bar 
            dataKey="count"
            name="Mentions"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(${210 - index * (150 / Math.max(data.length, 1))}, 80%, 55%)`} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
