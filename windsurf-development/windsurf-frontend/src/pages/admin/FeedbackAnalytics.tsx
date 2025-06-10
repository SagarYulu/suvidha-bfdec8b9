
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Star, 
  Users,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Download,
  Filter
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { apiService } from '@/services/apiService';

const FeedbackAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockAnalytics = {
    totalFeedback: 1247,
    averageRating: 4.2,
    responseRate: 78.5,
    satisfactionScore: 84,
    trends: {
      feedbackCount: 12,
      ratingImprovement: 0.3,
      responseRateChange: 5,
      satisfactionChange: 2
    },
    sentimentData: [
      { name: 'Positive', value: 65, count: 810, color: '#10B981' },
      { name: 'Neutral', value: 25, count: 312, color: '#F59E0B' },
      { name: 'Negative', value: 10, count: 125, color: '#EF4444' }
    ],
    categoryData: [
      { category: 'Service Quality', count: 312, rating: 4.5 },
      { category: 'Response Time', count: 289, rating: 3.8 },
      { category: 'Issue Resolution', count: 267, rating: 4.2 },
      { category: 'Communication', count: 198, rating: 4.1 },
      { category: 'App Experience', count: 181, rating: 3.9 }
    ],
    trendData: [
      { month: 'Jan', positive: 45, neutral: 20, negative: 8, rating: 3.9 },
      { month: 'Feb', positive: 52, neutral: 18, negative: 7, rating: 4.1 },
      { month: 'Mar', positive: 58, neutral: 22, negative: 6, rating: 4.2 },
      { month: 'Apr', positive: 61, neutral: 19, negative: 5, rating: 4.3 },
      { month: 'May', positive: 65, neutral: 25, negative: 10, rating: 4.2 },
      { month: 'Jun', positive: 68, neutral: 23, negative: 9, rating: 4.4 }
    ],
    recentFeedback: [
      {
        id: 1,
        rating: 5,
        comment: "Excellent service! Issue resolved quickly and professionally.",
        sentiment: 'positive',
        category: 'Service Quality',
        date: '2024-01-15',
        employee: 'EMP001'
      },
      {
        id: 2,
        rating: 4,
        comment: "Good experience overall, but response could be faster.",
        sentiment: 'positive',
        category: 'Response Time',
        date: '2024-01-14',
        employee: 'EMP002'
      },
      {
        id: 3,
        rating: 2,
        comment: "Issue took too long to resolve and communication was unclear.",
        sentiment: 'negative',
        category: 'Communication',
        date: '2024-01-13',
        employee: 'EMP003'
      }
    ]
  };

  useEffect(() => {
    fetchFeedbackAnalytics();
  }, [dateRange, categoryFilter, sentimentFilter]);

  const fetchFeedbackAnalytics = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const data = await apiService.getFeedbackAnalytics({
      //   dateRange,
      //   category: categoryFilter,
      //   sentiment: sentimentFilter
      // });
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default: return <Meh className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const exportData = () => {
    // Implement CSV export functionality
    console.log('Exporting feedback data...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics</h1>
          <p className="text-gray-600">Customer feedback insights and sentiment analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="service">Service Quality</SelectItem>
                <SelectItem value="response">Response Time</SelectItem>
                <SelectItem value="resolution">Issue Resolution</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="app">App Experience</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalFeedback?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />
              +{analytics?.trends?.feedbackCount}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageRating}/5</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />
              +{analytics?.trends?.ratingImprovement} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.responseRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />
              +{analytics?.trends?.responseRateChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.satisfactionScore}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />
              +{analytics?.trends?.satisfactionChange}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analytics?.sentimentData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics?.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#EF4444" fill="#EF4444" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.recentFeedback?.map((feedback: any) => (
              <div key={feedback.id} className="border-l-4 border-blue-200 pl-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge className={getSentimentColor(feedback.sentiment)}>
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(feedback.sentiment)}
                        <span className="capitalize">{feedback.sentiment}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline">{feedback.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {feedback.date} • {feedback.employee}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalytics;
