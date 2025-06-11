
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface SLAMetric {
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface SLAAnalysisSectionProps {
  slaMetrics: SLAMetric[];
  isLoading?: boolean;
}

const SLAAnalysisSection: React.FC<SLAAnalysisSectionProps> = ({ 
  slaMetrics, 
  isLoading = false 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SLA Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
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
      <CardContent>
        <div className="space-y-6">
          {slaMetrics.map((metric, index) => {
            const percentage = Math.min((metric.actual / metric.target) * 100, 100);
            const isWithinSLA = metric.actual <= metric.target;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <Badge variant={isWithinSLA ? "default" : "destructive"}>
                    {metric.actual}{metric.unit} / {metric.target}{metric.unit}
                  </Badge>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${getStatusColor(metric.status)}`}
                />
                <div className="text-sm text-gray-600">
                  Target: {metric.target}{metric.unit} | 
                  Current: {metric.actual}{metric.unit} | 
                  Performance: {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SLAAnalysisSection;
