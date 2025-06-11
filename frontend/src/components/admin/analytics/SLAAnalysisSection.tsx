
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLAMetric {
  name: string;
  target: number;
  actual: number;
  status: 'met' | 'warning' | 'breach';
}

interface SLAAnalysisSectionProps {
  metrics?: SLAMetric[];
  isLoading?: boolean;
}

const SLAAnalysisSection: React.FC<SLAAnalysisSectionProps> = ({
  metrics = [],
  isLoading = false
}) => {
  const defaultMetrics: SLAMetric[] = [
    { name: 'First Response Time', target: 2, actual: 1.8, status: 'met' },
    { name: 'Resolution Time', target: 24, actual: 18.5, status: 'met' },
    { name: 'Customer Satisfaction', target: 85, actual: 78, status: 'warning' },
    { name: 'Escalation Rate', target: 10, actual: 15, status: 'breach' }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'breach': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'breach': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          SLA Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{metric.name}</h4>
              <Badge className={getStatusColor(metric.status)}>
                {getStatusIcon(metric.status)}
                <span className="ml-1 capitalize">{metric.status}</span>
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Actual: {metric.actual}{metric.name.includes('Time') ? 'h' : '%'}</span>
                <span>Target: {metric.target}{metric.name.includes('Time') ? 'h' : '%'}</span>
              </div>
              <Progress 
                value={(metric.actual / metric.target) * 100} 
                className="h-2"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SLAAnalysisSection;
