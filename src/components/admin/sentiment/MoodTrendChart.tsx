
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, subMonths, subWeeks, subQuarters, subYears, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface MoodTrendChartProps {
  sentimentData: any[];
  dateRange: {
    from?: Date;
    to?: Date;
  } | undefined;
  isLoading: boolean;
}

type ComparisonType = 'none' | 'week' | 'month' | 'quarter' | 'year';

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ sentimentData, dateRange, isLoading }) => {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('none');
  const [trendData, setTrendData] = useState<any[]>([]);

  // Process sentiment data when it changes or comparison type changes
  useEffect(() => {
    if (!sentimentData || sentimentData.length === 0) return;
    
    // Group data by date
    const calculateAverageByDate = (data: any[]) => {
      return data.reduce((acc, curr) => {
        if (!curr.created_at) return acc;
        
        const date = format(parseISO(curr.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = { 
            count: 0, 
            totalRating: 0
          };
        }
        acc[date].count++;
        acc[date].totalRating += curr.rating;
        return acc;
      }, {} as Record<string, { count: number; totalRating: number }>);
    };

    // Get current period data
    const currentData = calculateAverageByDate(sentimentData);
    
    // Get comparison period data if needed
    const getComparisonData = () => {
      if (comparisonType === 'none') return null;
      
      let comparisonStartDate: Date | undefined;
      let comparisonEndDate: Date | undefined;
      
      if (dateRange?.from && dateRange?.to) {
        // Calculate the time difference between from and to dates
        const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
        
        // Set the comparison period based on selection
        switch (comparisonType) {
          case 'week':
            comparisonStartDate = subWeeks(dateRange.from, 1);
            comparisonEndDate = new Date(comparisonStartDate.getTime() + diffTime);
            break;
          case 'month':
            comparisonStartDate = subMonths(dateRange.from, 1);
            comparisonEndDate = new Date(comparisonStartDate.getTime() + diffTime);
            break;
          case 'quarter':
            comparisonStartDate = subQuarters(dateRange.from, 1);
            comparisonEndDate = new Date(comparisonStartDate.getTime() + diffTime);
            break;
          case 'year':
            comparisonStartDate = subYears(dateRange.from, 1);
            comparisonEndDate = new Date(comparisonStartDate.getTime() + diffTime);
            break;
        }
        
        // Filter data for comparison period
        const comparisonPeriodData = sentimentData.filter(item => {
          if (!item.created_at) return false;
          const itemDate = parseISO(item.created_at);
          return itemDate >= comparisonStartDate! && itemDate <= comparisonEndDate!;
        });
        
        return calculateAverageByDate(comparisonPeriodData);
      }
      
      return null;
    };
    
    const comparisonData = getComparisonData();
    
    // Combine both datasets for chart
    const allDates = new Set([
      ...Object.keys(currentData),
      ...(comparisonData ? Object.keys(comparisonData) : [])
    ].sort());
    
    const combinedData = Array.from(allDates).map(date => {
      const current = currentData[date];
      const comparison = comparisonData?.[date];
      
      return {
        date,
        currentRating: current ? (current.totalRating / current.count).toFixed(1) : null,
        previousRating: comparison ? (comparison.totalRating / comparison.count).toFixed(1) : null,
        // Add labels for tooltips
        currentLabel: comparisonType !== 'none' ? 'Current Period' : 'Rating',
        previousLabel: comparisonType === 'week' ? 'Previous Week' :
                      comparisonType === 'month' ? 'Previous Month' :
                      comparisonType === 'quarter' ? 'Previous Quarter' :
                      comparisonType === 'year' ? 'Previous Year' : ''
      };
    });
    
    setTrendData(combinedData);
  }, [sentimentData, dateRange, comparisonType]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!sentimentData || sentimentData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No sentiment data available for the selected filters.
        <p className="mt-2">Try clearing some filters or submitting feedback.</p>
      </div>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employee Mood Trend Over Time</CardTitle>
        <div className="w-52">
          <Label htmlFor="comparison-type" className="mb-1 block">Comparison</Label>
          <Select value={comparisonType} onValueChange={(value) => setComparisonType(value as ComparisonType)}>
            <SelectTrigger id="comparison-type">
              <SelectValue placeholder="No Comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Comparison</SelectItem>
              <SelectItem value="week">Week-on-week</SelectItem>
              <SelectItem value="month">Month-on-month</SelectItem>
              <SelectItem value="quarter">Quarter-on-quarter</SelectItem>
              <SelectItem value="year">Year-on-year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => {
                  const labels = {
                    1: "Very Low",
                    2: "Low",
                    3: "Neutral",
                    4: "Good", 
                    5: "Excellent"
                  };
                  return labels[value as keyof typeof labels] || value;
                }}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  const dataPoint = props.payload;
                  const label = name === 'currentRating' ? dataPoint.currentLabel : dataPoint.previousLabel;
                  return [`${value}`, label];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend 
                formatter={(value) => {
                  if (value === 'currentRating') return 'Current Period';
                  if (value === 'previousRating') return comparisonType === 'week' ? 'Previous Week' :
                            comparisonType === 'month' ? 'Previous Month' :
                            comparisonType === 'quarter' ? 'Previous Quarter' :
                            comparisonType === 'year' ? 'Previous Year' : '';
                  return value;
                }}
              />
              <Line
                type="monotone"
                dataKey="currentRating"
                stroke="#8884d8"
                name="currentRating"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                connectNulls
              />
              {comparisonType !== 'none' && (
                <Line
                  type="monotone"
                  dataKey="previousRating"
                  stroke="#82ca9d"
                  name="previousRating"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTrendChart;
