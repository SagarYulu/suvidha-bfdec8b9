
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, TrendingUp, Users } from 'lucide-react';

interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  satisfactionScore: number;
  recentFeedback: number;
  trendDirection: 'up' | 'down' | 'stable';
}

interface FeedbackMetricsOverviewProps {
  metrics: FeedbackMetrics;
  isLoading?: boolean;
}

const FeedbackMetricsOverview: React.FC<FeedbackMetricsOverviewProps> = ({
  metrics,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getSatisfactionBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalFeedback}</div>
          <p className="text-xs text-muted-foreground">
            +{metrics.recentFeedback} this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Out of 5.0 stars
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.responseRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            User participation rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{metrics.satisfactionScore}%</div>
            <Badge variant={getSatisfactionBadgeVariant(metrics.satisfactionScore)}>
              {metrics.trendDirection === 'up' ? '↑' : metrics.trendDirection === 'down' ? '↓' : '→'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Overall satisfaction
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackMetricsOverview;
