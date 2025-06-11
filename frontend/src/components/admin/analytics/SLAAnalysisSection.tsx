
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface SLAMetrics {
  totalIssues: number;
  withinSLA: number;
  breachedSLA: number;
  slaPercentage: number;
  avgResolutionTime: number;
  criticalBreaches: number;
}

interface SLAAnalysisSectionProps {
  metrics: SLAMetrics;
  isLoading?: boolean;
}

const SLAAnalysisSection: React.FC<SLAAnalysisSectionProps> = ({ 
  metrics, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SLA Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSLABadgeVariant = (percentage: number) => {
    if (percentage >= 95) return "default";
    if (percentage >= 85) return "secondary";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          SLA Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SLA Compliance</span>
              <Badge variant={getSLABadgeVariant(metrics.slaPercentage)}>
                {metrics.slaPercentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {metrics.withinSLA} / {metrics.totalIssues}
            </div>
            <div className="text-xs text-muted-foreground">
              Issues resolved within SLA
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Resolution Time</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgResolutionTime.toFixed(1)}h
            </div>
            <div className="text-xs text-muted-foreground">
              Average working hours
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Critical Breaches</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {metrics.criticalBreaches}
            </div>
            <div className="text-xs text-muted-foreground">
              High priority SLA breaches
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>SLA Compliance Rate</span>
            <span>{metrics.slaPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                metrics.slaPercentage >= 95 
                  ? 'bg-green-500' 
                  : metrics.slaPercentage >= 85 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: `${metrics.slaPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SLAAnalysisSection;
