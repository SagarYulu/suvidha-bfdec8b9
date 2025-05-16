
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
  Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

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
  'positive': '#4CAF50',
  'neutral': '#FFC107',
  'negative': '#F44336'
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

  // Calculate average sentiment by date
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

  // Convert to array for charts with simpler labels
  const timeSeriesData = Object.keys(sentimentByDate)
    .sort()
    .map(date => ({
      date,
      rating: (sentimentByDate[date].totalRating / sentimentByDate[date].count).toFixed(1),
      count: sentimentByDate[date].count,
    }));

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

  // Calculate rating distribution with descriptive labels
  const ratingLabels = {
    1: "Very Dissatisfied",
    2: "Dissatisfied",
    3: "Neutral",
    4: "Satisfied",
    5: "Very Satisfied"
  };
  
  const ratingDistribution = sentimentData.reduce((acc, curr) => {
    if (!acc[curr.rating]) {
      acc[curr.rating] = 0;
    }
    acc[curr.rating]++;
    return acc;
  }, {} as Record<number, number>);

  const ratingPieData = Object.keys(ratingDistribution).map(key => ({
    name: `${ratingLabels[Number(key) as keyof typeof ratingLabels]} (${key})`,
    value: ratingDistribution[Number(key)]
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

  console.log("Tag data:", tagData);

  // Create an array of mood data for the bar chart
  const moodData = Object.keys(ratingDistribution).map(key => ({
    rating: ratingLabels[Number(key) as keyof typeof ratingLabels],
    score: Number(key),
    count: ratingDistribution[Number(key)]
  }));

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
                  formatter={(value) => [`Average Rating: ${value}`, "Employee Mood"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#8884d8"
                  name="Employee Mood Rating (1-5)"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
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
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
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
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} responses`, `${value} responses`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Feedback Topics with clearer labeling */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Feedback Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {tagData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No feedback topics available for the selected filters.
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} mentions`, "Mentions"]}
                    labelFormatter={(label) => `Topic: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Times Mentioned"
                    fill="#00C49F"
                  />
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
