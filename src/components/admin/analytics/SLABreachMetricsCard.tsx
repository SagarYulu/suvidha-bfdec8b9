
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";

interface SLABreachMetricsCardProps {
  closedResolvedSLABreach: number;
  overallSLABreach: number;
  openInProgressSLABreach: number;
  firstResponseSLABreach: number;
  assigneeSLABreach: number;
}

export const SLABreachMetricsCard: React.FC<SLABreachMetricsCardProps> = ({
  closedResolvedSLABreach,
  overallSLABreach,
  openInProgressSLABreach,
  firstResponseSLABreach,
  assigneeSLABreach
}) => {
  const formatPercent = (value: number) => {
    return `${Math.round(value * 10) / 10}%`;
  };
  
  const SLAMetricItem = ({ label, value }: { label: string; value: number }) => {
    const showWarning = value > 0;
    
    return (
      <div className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${showWarning ? 'text-red-600' : 'text-green-600'}`}>
            {formatPercent(value)}
          </span>
          {showWarning && <CircleAlert className="h-4 w-4 text-red-500" />}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>SLA Breach Metrics</span>
          {(closedResolvedSLABreach > 0 || overallSLABreach > 0 || openInProgressSLABreach > 0 ||
            firstResponseSLABreach > 0 || assigneeSLABreach > 0) && (
            <CircleAlert className="h-4 w-4 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <SLAMetricItem label="Closed & Resolved SLA Breach" value={closedResolvedSLABreach} />
        <SLAMetricItem label="Overall SLA Breach" value={overallSLABreach} />
        <SLAMetricItem label="Open & In Progress SLA Breach" value={openInProgressSLABreach} />
        <SLAMetricItem label="First Response SLA Breach" value={firstResponseSLABreach} />
        <SLAMetricItem label="Assignee SLA Breach" value={assigneeSLABreach} />
      </CardContent>
    </Card>
  );
};
