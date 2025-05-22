
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { format, parse } from 'date-fns';

const COMPARISON_LABELS: Record<string, string> = {
  'dod': 'Day on Day',
  'wow': 'Week on Week',
  'mom': 'Month on Month',
  'qoq': 'Quarter on Quarter',
  'yoy': 'Year on Year'
};

// Define visually appealing colors
const CHART_COLORS = {
  happy: '#22c55e',
  neutral: '#f59e0b',
  sad: '#ef4444',
  grid: '#e2e8f0',
  tooltip: '#ffffff',
  happy_area: 'rgba(34, 197, 94, 0.1)',
  neutral_area: 'rgba(245, 158, 11, 0.1)',
  sad_area: 'rgba(239, 68, 68, 0.1)',
};

interface FeedbackTrendChartProps {
  data: Array<{ date: string; happy: number; neutral: number; sad: number; total: number }>;
  showComparison: boolean;
  comparisonMode?: string;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({ 
  data,
  showComparison,
  comparisonMode = 'wow'
}) => {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMM dd')
  }));
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    // Map internal names to display names
    const displayNames: Record<string, string> = {
      happy: 'Happy',
      neutral: 'Neutral',
      sad: 'Sad',
      total: 'Total'
    };
    
    return [`${value} responses`, displayNames[name] || name];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Feedback Trend
            {showComparison && comparisonMode && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({COMPARISON_LABELS[comparisonMode]})
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.happy} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS.happy} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.neutral} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS.neutral} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.sad} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS.sad} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: CHART_COLORS.tooltip, 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0'
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                
                {/* Areas */}
                <Area 
                  type="monotone" 
                  dataKey="happy" 
                  stroke={CHART_COLORS.happy} 
                  fillOpacity={1}
                  fill="url(#colorHappy)" 
                  stackId="1"
                  name="Happy"
                  hide={true} // Hide from legend but show area
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke={CHART_COLORS.neutral} 
                  fillOpacity={1}
                  fill="url(#colorNeutral)"
                  stackId="1"
                  name="Neutral"
                  hide={true} // Hide from legend but show area
                />
                <Area 
                  type="monotone" 
                  dataKey="sad" 
                  stroke={CHART_COLORS.sad} 
                  fillOpacity={1}
                  fill="url(#colorSad)"
                  stackId="1" 
                  name="Sad"
                  hide={true} // Hide from legend but show area
                />
                
                {/* Lines */}
                <Line 
                  type="monotone" 
                  dataKey="happy" 
                  name="Happy"
                  stroke={CHART_COLORS.happy} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: CHART_COLORS.happy }}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.happy, r: 4, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  name="Neutral"
                  stroke={CHART_COLORS.neutral} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: CHART_COLORS.neutral }}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.neutral, r: 4, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sad" 
                  name="Sad"
                  stroke={CHART_COLORS.sad} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: CHART_COLORS.sad }}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.sad, r: 4, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendChart;
