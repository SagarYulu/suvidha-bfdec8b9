
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TopicRadarChartProps {
  data: Array<{
    subject: string;
    count: number;
    fullMark: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const TopicRadarChart: React.FC<TopicRadarChartProps> = ({ data, showComparison = false }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
          <Radar
            name="Current Period"
            dataKey="count"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.6}
          />
          {showComparison && (
            <Radar
              name="Previous Period"
              dataKey="previousCount"
              stroke="#64748b"
              fill="#64748b"
              fillOpacity={0.4}
            />
          )}
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicRadarChart;
