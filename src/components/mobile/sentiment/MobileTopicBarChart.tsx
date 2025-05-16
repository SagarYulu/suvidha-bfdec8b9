
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Topic Frequency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'Mentions', position: 'insideLeft', angle: -90, dy: 40, dx: -5, style: { textAnchor: 'middle', fontSize: 11 } }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} mentions`, "Count"]}
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <Bar 
                  dataKey="count" 
                  name="Mentions"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
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
