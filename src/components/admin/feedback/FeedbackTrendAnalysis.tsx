
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

// Define visually distinct colors
const COLORS = {
  happy: '#22c55e',
  neutral: '#f59e0b',
  sad: '#ef4444',
  grid: '#e2e8f0',
};

interface FeedbackTrendAnalysisProps {
  data: Array<{ 
    date: string; 
    formattedDate?: string;
    happy: number; 
    neutral: number; 
    sad: number; 
    total: number 
  }>;
  showComparison?: boolean;
}

const FeedbackTrendAnalysis: React.FC<FeedbackTrendAnalysisProps> = ({ 
  data,
  showComparison = false
}) => {
  // Format data for the chart
  const formattedData = data.map(item => ({
    ...item,
    // If formattedDate is already set, use it, otherwise format from date
    name: item.formattedDate || item.date,
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
        <CardTitle>Sentiment Distribution Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                barGap={0}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={tooltipFormatter}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend
                  iconType="circle"
                  verticalAlign="top"
                  align="right"
                />
                <Bar dataKey="happy" name="Happy" fill={COLORS.happy} radius={[4, 4, 0, 0]} />
                <Bar dataKey="neutral" name="Neutral" fill={COLORS.neutral} radius={[4, 4, 0, 0]} />
                <Bar dataKey="sad" name="Sad" fill={COLORS.sad} radius={[4, 4, 0, 0]} />
              </BarChart>
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

export default FeedbackTrendAnalysis;
