
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  period: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
}

interface TrendAnalysisSectionProps {
  title: string;
  data: TrendData[];
  isLoading?: boolean;
}

const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  title,
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadgeVariant = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return "default";
      case 'decrease':
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(item.changeType)}
                <span className="font-medium">{item.period}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">{item.value}</span>
                <Badge variant={getTrendBadgeVariant(item.changeType)}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisSection;
