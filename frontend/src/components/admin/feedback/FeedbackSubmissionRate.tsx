
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Users, TrendingUp } from 'lucide-react';

interface SubmissionData {
  date: string;
  submissions: number;
  target: number;
  activeUsers: number;
}

interface FeedbackSubmissionRateProps {
  data: SubmissionData[];
  isLoading?: boolean;
}

const FeedbackSubmissionRate: React.FC<FeedbackSubmissionRateProps> = ({
  data,
  isLoading = false
}) => {
  const calculateMetrics = () => {
    if (!data || data.length === 0) return null;

    const totalSubmissions = data.reduce((sum, item) => sum + item.submissions, 0);
    const totalTarget = data.reduce((sum, item) => sum + item.target, 0);
    const averageActiveUsers = data.reduce((sum, item) => sum + item.activeUsers, 0) / data.length;
    const achievementRate = totalTarget > 0 ? (totalSubmissions / totalTarget) * 100 : 0;

    return {
      totalSubmissions,
      totalTarget,
      averageActiveUsers: Math.round(averageActiveUsers),
      achievementRate
    };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submission Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submission Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No submission data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Feedback Submission Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalSubmissions}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.totalTarget}</div>
              <div className="text-sm text-gray-600">Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.averageActiveUsers}</div>
              <div className="text-sm text-gray-600">Avg Active Users</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.achievementRate >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {metrics.achievementRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Achievement Rate</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis yAxisId="submissions" orientation="left" />
              <YAxis yAxisId="users" orientation="right" />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                formatter={(value, name) => [
                  value,
                  name === 'submissions' ? 'Submissions' :
                  name === 'target' ? 'Target' :
                  'Active Users'
                ]}
              />
              <Legend />
              <Line 
                yAxisId="submissions"
                type="monotone" 
                dataKey="submissions" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Submissions"
              />
              <Line 
                yAxisId="submissions"
                type="monotone" 
                dataKey="target" 
                stroke="#dc2626" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
              <Line 
                yAxisId="users"
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#7c3aed" 
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
