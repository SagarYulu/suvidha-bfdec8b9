
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonData {
  metric: string;
  current: number;
  previous: number;
  unit?: string;
  format?: 'number' | 'percentage';
}

interface ComparisonInsightsProps {
  data: ComparisonData[];
  period: string;
  isLoading?: boolean;
}

const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({
  data,
  period,
  isLoading = false
}) => {
  const getChangeIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4" />;
    if (current < previous) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatValue = (value: number, format?: string, unit?: string) => {
    let formatted = value.toString();
    
    if (format === 'percentage') {
      formatted = `${value.toFixed(1)}%`;
    } else if (format === 'number') {
      formatted = value.toLocaleString();
    }
    
    if (unit && format !== 'percentage') {
      formatted += ` ${unit}`;
    }
    
    return formatted;
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Period Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <p className="text-sm text-gray-600">
          Current vs Previous {period}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const changePercent = getChangePercentage(item.current, item.previous);
            const changeColor = getChangeColor(item.current, item.previous);
            
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.metric}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-semibold">
                      {formatValue(item.current, item.format, item.unit)}
                    </span>
                    <Badge variant="outline" className={`${changeColor} border-current`}>
                      <div className="flex items-center gap-1">
                        {getChangeIcon(item.current, item.previous)}
                        <span className="text-xs">
                          {Math.abs(changePercent).toFixed(1)}%
                        </span>
                      </div>
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <p>Previous</p>
                  <p>{formatValue(item.previous, item.format, item.unit)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonInsights;
