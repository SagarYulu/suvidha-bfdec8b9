
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, MessageSquare, Users, Clock } from 'lucide-react';

interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  completionTime: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface FeedbackMetricsOverviewProps {
  data: FeedbackMetrics | undefined;
  isLoading?: boolean;
}

const FeedbackMetricsOverview: React.FC<FeedbackMetricsOverviewProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No feedback metrics available
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Total Feedback',
      value: data.totalFeedback.toLocaleString(),
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      description: 'Feedback submissions'
    },
    {
      title: 'Average Rating',
      value: `${data.averageRating.toFixed(1)}/5.0`,
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      description: 'Overall satisfaction'
    },
    {
      title: 'Response Rate',
      value: `${data.responseRate.toFixed(1)}%`,
      icon: <Users className="h-5 w-5 text-green-600" />,
      description: 'Participation rate'
    },
    {
      title: 'Avg. Completion Time',
      value: `${data.completionTime.toFixed(1)}min`,
      icon: <Clock className="h-5 w-5 text-purple-600" />,
      description: 'Time to complete'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                {metric.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-gray-600">{metric.title}</h3>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sentiment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-600">Positive</span>
                <span className="text-sm">{data.sentimentBreakdown.positive}%</span>
              </div>
              <Progress value={data.sentimentBreakdown.positive} className="h-2 bg-green-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Neutral</span>
                <span className="text-sm">{data.sentimentBreakdown.neutral}%</span>
              </div>
              <Progress value={data.sentimentBreakdown.neutral} className="h-2 bg-gray-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-red-600">Negative</span>
                <span className="text-sm">{data.sentimentBreakdown.negative}%</span>
              </div>
              <Progress value={data.sentimentBreakdown.negative} className="h-2 bg-red-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackMetricsOverview;
