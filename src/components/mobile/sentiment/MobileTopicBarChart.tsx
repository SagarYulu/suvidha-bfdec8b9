
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface MobileTopicBarChartProps {
  data: { name: string; count: number }[];
}

const MobileTopicBarChart: React.FC<MobileTopicBarChartProps> = ({ data }) => {
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

  // Generate colors based on the index
  const generateColor = (index: number) => {
    const hue = 200 + (index * 30) % 150;
    return `hsl(${hue}, 80%, 60%)`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-sm">
          <p className="font-medium">{label}</p>
          <p>{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/10 text-white">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-2">Topic Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              layout="vertical"
            >
              <XAxis type="number" tick={{ fill: 'white', fontSize: 10 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: 'white', fontSize: 10 }} 
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={generateColor(index)} />
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
