
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SentimentGroup } from '@/services/feedbackAnalyticsService';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';

interface FeedbackHierarchyChartProps {
  data: SentimentGroup[];
  totalCount: number;
}

const FeedbackHierarchyChart: React.FC<FeedbackHierarchyChartProps> = ({
  data,
  totalCount
}) => {
  // Prepare data for the pie chart
  const pieData = data.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    color: item.color
  }));

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: {data.value} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderCustomTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Detailed breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Detailed Breakdown</h4>
              {data.map((sentiment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium" style={{ color: sentiment.color }}>
                      {sentiment.name}
                    </h5>
                    <span className="text-sm text-gray-600">
                      {sentiment.value} responses ({sentiment.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  
                  {sentiment.subReasons && sentiment.subReasons.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {sentiment.subReasons.slice(0, 5).map((reason, reasonIndex) => (
                        <div key={reasonIndex} className="flex justify-between text-sm">
                          <span className="text-gray-600">{reason.name}</span>
                          <span className="text-gray-500">
                            {reason.value} ({reason.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No feedback data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackHierarchyChart;
