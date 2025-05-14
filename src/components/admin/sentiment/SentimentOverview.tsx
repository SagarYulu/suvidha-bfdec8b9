
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
  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ['sentiment', filters],
    queryFn: () => fetchAllSentiment(filters)
  });

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
      </div>
    );
  }

  // Calculate average sentiment by date
  const sentimentByDate = sentimentData.reduce((acc, curr) => {
    const date = format(parseISO(curr.created_at!), 'yyyy-MM-dd');
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

  // Convert to array for charts
  const timeSeriesData = Object.keys(sentimentByDate)
    .sort()
    .map(date => ({
      date,
      averageRating: sentimentByDate[date].totalRating / sentimentByDate[date].count,
      averageScore: sentimentByDate[date].totalScore / sentimentByDate[date].count,
      count: sentimentByDate[date].count,
    }));

  // Calculate sentiment distribution
  const sentimentDistribution = sentimentData.reduce((acc, curr) => {
    const label = curr.sentiment_label || 'unknown';
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

  // Calculate rating distribution
  const ratingDistribution = sentimentData.reduce((acc, curr) => {
    if (!acc[curr.rating]) {
      acc[curr.rating] = 0;
    }
    acc[curr.rating]++;
    return acc;
  }, {} as Record<number, number>);

  const ratingPieData = Object.keys(ratingDistribution).map(key => ({
    name: `Rating ${key}`,
    value: ratingDistribution[Number(key)]
  }));

  // Calculate tag distribution
  const tagCounts: Record<string, number> = {};
  sentimentData.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const tagData = Object.keys(tagCounts)
    .map(tag => ({ name: tag, count: tagCounts[tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Time Series Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
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
                <YAxis yAxisId="left" domain={[1, 5]} />
                <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="averageRating"
                  stroke="#8884d8"
                  name="Average Rating (1-5)"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#82ca9d"
                  name="Sentiment Score (-1 to 1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.keys(ratingDistribution).map(key => ({
                  rating: `Rating ${key}`,
                  count: ratingDistribution[Number(key)]
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Tags */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Feedback Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tagData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentOverview;
