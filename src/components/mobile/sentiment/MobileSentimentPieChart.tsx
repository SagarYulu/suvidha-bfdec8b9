
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';

interface MobileSentimentPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const MobileSentimentPieChart: React.FC<MobileSentimentPieChartProps> = ({ data }) => {
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name.toLowerCase() === 'positive' ? SENTIMENT_COLORS.positive :
                        entry.name.toLowerCase() === 'negative' ? SENTIMENT_COLORS.negative :
                        entry.name.toLowerCase() === 'neutral' ? SENTIMENT_COLORS.neutral :
                        `#${Math.floor(Math.random()*16777215).toString(16)}`
                      } 
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} responses`, "Count"]}
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No sentiment data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileSentimentPieChart;
