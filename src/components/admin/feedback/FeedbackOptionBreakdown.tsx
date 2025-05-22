
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Label
} from 'recharts';

// Define colors for different sentiments
const COLORS = {
  happy: '#22c55e',    // Green
  neutral: '#f59e0b',  // Amber
  sad: '#ef4444'       // Red
};

interface FeedbackOptionBreakdownProps {
  options: Array<{ option: string; count: number; sentiment: 'happy' | 'neutral' | 'sad' }>;
  showComparison: boolean;
}

const FeedbackOptionBreakdown: React.FC<FeedbackOptionBreakdownProps> = ({
  options,
  showComparison
}) => {
  // Take the top 8 options for the chart to avoid clutter
  const topOptions = options.slice(0, 8);
  const totalResponses = topOptions.reduce((sum, item) => sum + item.count, 0);
  
  // Format data for the donut chart
  const chartData = topOptions.map(item => ({
    name: item.option,
    value: item.count,
    sentiment: item.sentiment,
    percentage: ((item.count / totalResponses) * 100).toFixed(1)
  }));
  
  // Custom legend that shows sentiment color
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-col gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs truncate max-w-[200px]">
              {entry.value} ({entry.payload.percentage}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };
  
  // Custom tooltip
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">Count: <span className="font-medium">{payload[0].value}</span></p>
          <p className="text-sm">
            Percentage: <span className="font-medium">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Option Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.sentiment]} 
                    />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox as any;
                      return (
                        <g>
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xl font-bold"
                          >
                            {totalResponses}
                          </text>
                          <text
                            x={cx}
                            y={cy + 20}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs fill-muted-foreground"
                          >
                            Total
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend
                  content={renderCustomLegend}
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No feedback option data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackOptionBreakdown;
