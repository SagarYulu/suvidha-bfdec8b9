
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface MobileTopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const MobileTopicBarChart: React.FC<MobileTopicBarChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-blue-600 text-sm">
            Current: {payload[0].value}
          </p>
          {showComparison && payload[1] && (
            <p className="text-gray-600 text-sm">
              Previous: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Truncate long names for mobile
  const processedData = data.map(item => ({
    ...item,
    shortName: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 40
          }}
        >
          <XAxis 
            dataKey="shortName" 
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} />
          {showComparison && (
            <Bar dataKey="previousCount" fill="#64748b" radius={[2, 2, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MobileTopicBarChart;
