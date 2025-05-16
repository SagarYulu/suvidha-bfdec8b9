
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

interface TopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const TopicBarChart: React.FC<TopicBarChartProps> = ({ data, showComparison = false }) => {
  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              Current: <span className="font-medium">{item.count}</span> mentions
            </p>
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-sm">
                Previous: <span className="font-medium">{item.previousCount}</span> mentions
              </p>
            )}
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-sm pt-1 border-t border-gray-100">
                Change: {" "}
                <span className={
                  item.count > item.previousCount 
                    ? "text-green-600 font-medium" 
                    : item.count < item.previousCount 
                      ? "text-red-600 font-medium" 
                      : "text-gray-600"
                }>
                  {item.count > item.previousCount ? '+' : ''}
                  {item.count - item.previousCount} mentions
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

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
            label={{ 
              value: 'Number of Mentions', 
              position: 'insideLeft', 
              angle: -90, 
              dy: 50, 
              dx: -10, 
              style: { textAnchor: 'middle' } 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }} 
            formatter={(value) => (value === "previousCount" ? "Previous Period" : "Current Period")}
          />
          
          {/* Previous period bars (if comparison enabled) */}
          {showComparison && (
            <Bar 
              dataKey="previousCount"
              name="previousCount"
              radius={[0, 0, 0, 0]}
              fill="#9CA3AF"
              fillOpacity={0.6}
              barSize={20}
            />
          )}
          
          {/* Current period bars */}
          <Bar 
            dataKey="count"
            name="Current Period"
            radius={[4, 4, 0, 0]}
            barSize={20}
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
