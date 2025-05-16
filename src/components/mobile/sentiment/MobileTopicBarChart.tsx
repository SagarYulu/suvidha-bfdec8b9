
import React from 'react';
import {
  AreaChart,
  Area,
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
        <div className="h-64 overflow-x-auto">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 20, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  height={60}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} mentions`, "Count"]}
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <defs>
                  <linearGradient
                    id="colorCount"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop 
                      offset="5%"
                      stopColor="#3B82F6"
                      stopOpacity={0.8}
                    />
                    <stop 
                      offset="95%"
                      stopColor="#3B82F6"
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6"
                  fill="url(#colorCount)"
                  name="Mentions"
                />
              </AreaChart>
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
