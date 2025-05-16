
import React from 'react';
import {
  AreaChart,
  Area,
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
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            height={60}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} mentions`, "Mentions"]}
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb' 
            }}
          />
          <defs>
            {data.map((entry, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`colorCount${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop 
                  offset="5%" 
                  stopColor={`hsl(${210 - index * (150 / data.length)}, 80%, 55%)`} 
                  stopOpacity={0.8}
                />
                <stop 
                  offset="95%" 
                  stopColor={`hsl(${210 - index * (150 / data.length)}, 80%, 55%)`} 
                  stopOpacity={0.2}
                />
              </linearGradient>
            ))}
          </defs>
          <Area 
            type="monotone" 
            dataKey="count" 
            name="Times Mentioned"
            stroke="#8884d8"
            fill="url(#colorCount0)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
