
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSentiment } from '@/services/sentimentService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SentimentOverviewProps {
  filters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const SENTIMENT_COLORS = {
  'positive': '#4ADE80',  // Lighter green
  'neutral': '#FBBF24',   // Lighter yellow
  'negative': '#F87171'   // Lighter red
};

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ filters }) => {
  const { data: sentimentData, isLoading, refetch } = useQuery({
    queryKey: ['sentiment', filters],
    queryFn: () => fetchAllSentiment(filters),
    staleTime: 30000, // 30 seconds
  });

  // Force refetch when filters change
  React.useEffect(() => {
    console.log("Sentiment Overview filters changed, refetching data:", filters);
    refetch();
  }, [filters, refetch]);

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

  // Calculate average sentiment by date - Ensure dates are properly sorted
  const sentimentByDate = sentimentData.reduce((acc, curr) => {
    if (!curr.created_at) return acc;
    
    const date = format(parseISO(curr.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { 
        count: 0, 
        totalRating: 0, 
        totalScore: 0,
        ratings: [0, 0, 0, 0, 0] // Count for each rating (1-5)
      };
    }
    acc[date].count++;
    acc[date].totalRating += curr.rating;
    if (curr.sentiment_score !== null && curr.sentiment_score !== undefined) {
      acc[date].totalScore += curr.sentiment_score;
    }
    acc[date].ratings[curr.rating - 1]++;
    return acc;
  }, {} as Record<string, { count: number; totalRating: number; totalScore: number, ratings: number[] }>);

  // Sort dates chronologically for the time series
  const timeSeriesData = Object.keys(sentimentByDate)
    .sort()
    .map(date => ({
      date,
      rating: parseFloat((sentimentByDate[date].totalRating / sentimentByDate[date].count).toFixed(1)),
      count: sentimentByDate[date].count,
    }));

  console.log("Time series data for chart:", timeSeriesData);

  // Calculate sentiment distribution with clearer labels
  const sentimentDistribution = sentimentData.reduce((acc, curr) => {
    let label = curr.sentiment_label?.toLowerCase() || 'unknown';
    // Simplify labels to just positive, neutral, negative
    if (label.includes('positive')) label = 'positive';
    if (label.includes('negative')) label = 'negative';
    if (label.includes('neutral')) label = 'neutral';
    
    if (!acc[label]) {
      acc[label] = 0;
    }
    acc[label]++;
    return acc;
  }, {} as Record<string, number>);

  const sentimentPieData = Object.keys(sentimentDistribution).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: sentimentDistribution[key]
  }));

  // Calculate tag distribution with improved handling
  const tagCounts: Record<string, number> = {};
  let taggedFeedbackCount = 0;
  
  sentimentData.forEach(item => {
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
      taggedFeedbackCount++;
      item.tags.forEach(tag => {
        if (tag) { // Only count non-empty tags
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });
  
  // For sentiment with no tags, create default categories
  if (taggedFeedbackCount === 0 && sentimentData.length > 0) {
    console.log("No tagged feedback found, creating default categories");
    
    // Count sentiment label distribution for default categories
    sentimentData.forEach(item => {
      const label = item.sentiment_label?.toLowerCase() || 'unknown';
      const tagName = `${label.charAt(0).toUpperCase() + label.slice(1)} Feedback`;
      tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
    });
  }

  const tagData = Object.keys(tagCounts)
    .map(tag => ({ name: tag, count: tagCounts[tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate radar chart data for tag analysis
  const radarData = tagData.slice(0, 5).map(item => ({
    subject: item.name,
    count: item.count,
    fullMark: Math.max(...tagData.map(t => t.count)) + 2
  }));

  // Custom formatter for the line chart tooltips
  const moodTooltipFormatter = (value: number, name: string) => {
    const moodLabels: Record<number, string> = {
      1: 'Very Low',
      2: 'Low',
      3: 'Neutral',
      4: 'Good',
      5: 'Excellent'
    };
    
    const closestMood = Object.keys(moodLabels)
      .map(Number)
      .reduce((prev, curr) => {
        return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
      }, 3);
      
    return [`${value} (${moodLabels[closestMood]})`, "Mood Rating"];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Mood Trend Over Time */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Employee Mood Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
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
                    return value.toString();
                  }}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={moodTooltipFormatter}
                  labelFormatter={(label) => `Date: ${format(new Date(label), 'MMMM dd, yyyy')}`}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    border: '1px solid #e5e7eb' 
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#3B82F6"
                  name="Employee Mood Rating"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 8, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Distribution with clearer labels */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  labelLine={{ strokeWidth: 1, stroke: '#9CA3AF' }}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name.toLowerCase() === 'positive' ? SENTIMENT_COLORS.positive :
                        entry.name.toLowerCase() === 'negative' ? SENTIMENT_COLORS.negative :
                        entry.name.toLowerCase() === 'neutral' ? SENTIMENT_COLORS.neutral :
                        COLORS[index % COLORS.length]
                      } 
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} responses`, `${value} responses`]} 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    border: '1px solid #e5e7eb' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Radar chart for top tags */}
      <Card>
        <CardHeader>
          <CardTitle>Top Feedback Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {radarData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} width={730} height={250} data={radarData}>
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
          ) : (
            <div className="text-center text-gray-500 py-8">
              No feedback topics available for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Feedback Topics with clearer labeling */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Topic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {tagData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No feedback topics available for the selected filters.</p>
              <p className="mt-2">Try clearing some filters or submitting more detailed feedback.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tagData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} mentions`, "Mentions"]}
                    labelFormatter={(label) => `Topic: ${label}`}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      border: '1px solid #e5e7eb' 
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Times Mentioned"
                  >
                    {tagData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${210 - index * (150 / tagData.length)}, 80%, 55%)`} 
                        radius={[0, 4, 4, 0]}
                      />
                    ))}
                    <LabelList 
                      dataKey="count" 
                      position="right" 
                      style={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }}
                      offset={10} 
                      formatter={(value: any): string | number => {
                        if (Array.isArray(value)) {
                          // Convert only the first element to a string, not the whole array
                          return String(value[0] || 0);
                        }
                        // Return the value directly if it's already a string or number
                        return typeof value === 'string' || typeof value === 'number' ? value : String(value);
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentOverview;
