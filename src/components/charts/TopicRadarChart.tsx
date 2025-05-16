
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TopicRadarChartProps {
  data: Array<{
    subject: string;
    count: number;
    fullMark: number;
  }>;
}

const TopicRadarChart: React.FC<TopicRadarChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} width={730} height={250} data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#6B7280', fontSize: 10 }} />
          <Radar
            name="Topic Frequency"
            dataKey="count"
            stroke="#2563EB"
            fill="#3B82F6"
            fillOpacity={0.6}
          />
          <Tooltip
            formatter={(value) => [`${value} mentions`, "Frequency"]}
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb' 
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicRadarChart;
