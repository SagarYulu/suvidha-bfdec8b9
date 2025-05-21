
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentPieChartProps {
  data: { name: string; value: number }[];
}

const MobileSentimentPieChart: React.FC<SentimentPieChartProps> = ({ data }) => {
  const COLORS = {
    'Positive': '#4CAF50',
    'Negative': '#F44336',
    'Neutral': '#FFC107',
    'Unknown': '#9E9E9E'
  };
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/10 text-white">
        <CardContent className="p-4">
          <div className="h-64 flex items-center justify-center">
            <p className="text-center opacity-70">No sentiment data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 text-white">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-2">Sentiment Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || '#9E9E9E'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', border: 'none' }}
                formatter={(value) => [`${value} items`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileSentimentPieChart;
