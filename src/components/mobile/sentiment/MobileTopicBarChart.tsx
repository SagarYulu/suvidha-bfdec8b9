
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TopicBarChartProps {
  data: { name: string; count: number }[];
}

const MobileTopicBarChart: React.FC<TopicBarChartProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/10 text-white">
        <CardContent className="p-4">
          <div className="h-64 flex items-center justify-center">
            <p className="text-center opacity-70">No topic data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 text-white">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-2">Top Topics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: 'white', fontSize: 12 }} 
                width={100}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', border: 'none' }}
                labelStyle={{ color: 'white' }}
                formatter={(value) => [`${value} mentions`, '']}
              />
              <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileTopicBarChart;
