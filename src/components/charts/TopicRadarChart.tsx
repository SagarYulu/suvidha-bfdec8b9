
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface TopicRadarChartProps {
  data: Array<{
    subject: string;
    count: number;
    previousCount?: number;
    fullMark: number;
  }>;
  showComparison?: boolean;
}

const TopicRadarChart: React.FC<TopicRadarChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 11 }}
          />
          <PolarRadiusAxis 
            tick={{ fontSize: 10 }}
            angle={90}
            domain={[0, 'dataMax']}
          />
          <Radar
            name="Current Period"
            dataKey="count"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {showComparison && (
            <Radar
              name="Previous Period"
              dataKey="previousCount"
              stroke="#94A3B8"
              fill="#94A3B8"
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicRadarChart;
