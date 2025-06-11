
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, MessageSquare } from 'lucide-react';

const FeedbackMetricsOverview: React.FC = () => {
  const metrics = [
    {
      title: 'Total Feedback',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: MessageSquare
    },
    {
      title: 'Response Rate',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'Positive Sentiment',
      value: '76%',
      change: '-2%',
      trend: 'down',
      icon: Users
    },
    {
      title: 'Avg Rating',
      value: '4.2',
      change: '+0.3',
      trend: 'up',
      icon: TrendingUp
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === 'up';
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`text-xs flex items-center ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {metric.change} from last month
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FeedbackMetricsOverview;
