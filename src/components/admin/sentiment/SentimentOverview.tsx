
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSentiment } from '@/services/sentimentService';
import {
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
import { format, parseISO } from 'date-fns';
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

  // Create an array of mood data for the bar chart
  const moodData = Object.keys(ratingDistribution).map(key => ({
    rating: ratingLabels[Number(key) as keyof typeof ratingLabels],
    score: Number(key),
    count: ratingDistribution[Number(key)]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Rating Distribution with clearer labels */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moodData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} responses`, "Count"]}
                  labelFormatter={(label) => `Mood: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  name="Number of Responses"
                >
                  {moodData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={
                        entry.score <= 2 ? "#F44336" : // Red for negative
                        entry.score === 3 ? "#FFC107" : // Yellow for neutral
                        "#4CAF50" // Green for positive
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentOverview;
