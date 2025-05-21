
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface TopicRadarChartProps {
  data: { subject: string; count: number; fullMark: number }[];
}

const MobileTopicRadarChart: React.FC<TopicRadarChartProps> = ({ data }) => {
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
        <h3 className="text-lg font-medium mb-2">Topic Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={75} data={data}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'white', fontSize: 10 }} 
              />
              <Radar
                name="Topics"
                dataKey="count"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileTopicRadarChart;
