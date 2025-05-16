
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MobileTopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const MobileTopicBarChart: React.FC<MobileTopicBarChartProps> = ({ data }) => {
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
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Topic Frequency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-x-auto">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} mentions`, "Count"]}
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="count" name="Mentions">
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
                    formatter={(value: any) => formatLabel(value)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No topic data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileTopicBarChart;
