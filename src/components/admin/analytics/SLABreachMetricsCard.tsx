
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert, CheckCircle } from "lucide-react";

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
  
  // Simple function to determine if SLA is breached based on threshold
  const isSLABreached = (value: number): boolean => value > 0;
  
  const SLAMetricRow = ({ label, value }: { label: string; value: number }) => {
    const isBreached = isSLABreached(value);
    
    return (
      <div className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-100">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          {isBreached ? (
            <>
              <span className="text-red-600 font-bold">{formatPercent(value)}</span>
              <CircleAlert className="h-4 w-4 text-red-500" />
            </>
          ) : (
            <>
              <span className="text-green-600 font-bold">0%</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="col-span-3 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span>SLA Breach Metrics</span>
          {(closedResolvedSLABreach > 0 || overallSLABreach > 0 || openInProgressSLABreach > 0 ||
            firstResponseSLABreach > 0 || assigneeSLABreach > 0) && (
            <CircleAlert className="h-4 w-4 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <SLAMetricRow label="Closed & Resolved SLA Breach" value={closedResolvedSLABreach} />
        <SLAMetricRow label="Overall SLA Breach" value={overallSLABreach} />
        <SLAMetricRow label="Open & In Progress SLA Breach" value={openInProgressSLABreach} />
        <SLAMetricRow label="First Response SLA Breach" value={firstResponseSLABreach} />
        <SLAMetricRow label="Assignee SLA Breach" value={assigneeSLABreach} />
      </CardContent>
    </Card>
  );
};
