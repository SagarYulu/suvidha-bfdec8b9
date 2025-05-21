
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendKPIData } from "@/services/issues/ticketTrendService";
import { AlertTriangle, Clock } from "lucide-react";

interface SLABreachMetricsCardProps {
  data: TrendKPIData;
  isLoading: boolean;
}

interface BreachMetric {
  title: string;
  value: string;
  percentage: string;
  icon: React.ReactNode;
  color: string;
  background: string;
  border: string;
}

const SLABreachMetricsCard: React.FC<SLABreachMetricsCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-5 w-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calculate actual ticket counts for SLA breaches
  const totalTickets = data.totalTickets;
  const resolvedTickets = data.resolvedTickets;
  const openInProgressTickets = data.openTickets;
  
  // Use statusDistribution from kpis object if available
  const inProgressCount = data.statusDistribution?.in_progress || Math.round(openInProgressTickets * 0.6);
  
  // Calculate breached tickets
  const closedBreachedTickets = Math.round((data.closedTicketsSLABreach / 100) * resolvedTickets);
  const activeBreachedTickets = Math.round((data.openTicketsSLABreach / 100) * openInProgressTickets);
  const totalBreachedTickets = activeBreachedTickets + closedBreachedTickets;
  const firstResponseBreachedTickets = Math.round((data.firstResponseSLABreach / 100) * totalTickets);
  const assigneeBreachedTickets = Math.round((data.assigneeSLABreach / 100) * totalTickets);

  // Format percentages with one decimal place
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
  // Create breach metrics array
  const breachMetrics: BreachMetric[] = [
    {
      title: "Closed & Resolved SLA Breach",
      value: closedBreachedTickets.toString(),
      percentage: formatPercentage(data.closedTicketsSLABreach),
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: closedBreachedTickets > 0 ? "text-amber-600" : "text-green-600",
      background: closedBreachedTickets > 0 ? "bg-amber-50" : "bg-green-50",
      border: closedBreachedTickets > 0 ? "border-amber-200" : "border-green-200",
    },
    {
      title: "Overall SLA Breach",
      value: totalBreachedTickets.toString(),
      percentage: formatPercentage(totalBreachedTickets > 0 ? 
        ((totalBreachedTickets / totalTickets) * 100) : data.resolutionSLABreach),
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      color: "text-red-600",
      background: "bg-red-50",
      border: "border-red-200",
    },
    {
      title: "Open & In Progress SLA Breach",
      value: activeBreachedTickets.toString(),
      percentage: formatPercentage(data.openTicketsSLABreach),
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      color: "text-red-600",
      background: "bg-red-50",
      border: "border-red-200",
    },
    {
      title: "First Response SLA Breach",
      value: firstResponseBreachedTickets.toString(),
      percentage: formatPercentage(data.firstResponseSLABreach),
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: data.firstResponseSLABreach > 5 ? "text-amber-600" : "text-green-600",
      background: data.firstResponseSLABreach > 5 ? "bg-amber-50" : "bg-green-50",
      border: data.firstResponseSLABreach > 5 ? "border-amber-200" : "border-green-200",
    },
    {
      title: "Assignee SLA Breach",
      value: assigneeBreachedTickets.toString(),
      percentage: formatPercentage(data.assigneeSLABreach),
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: assigneeBreachedTickets > 0 ? "text-amber-600" : "text-green-600",
      background: assigneeBreachedTickets > 0 ? "bg-amber-50" : "bg-green-50",
      border: assigneeBreachedTickets > 0 ? "border-amber-200" : "border-green-200",
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">SLA Breach Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {breachMetrics.map((metric, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center p-3 rounded-md ${metric.background} ${metric.border} border`}
          >
            <div className="flex items-center">
              {parseInt(metric.value) > 0 && metric.icon}
              <span className={`ml-2 font-medium ${metric.color}`}>{metric.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${metric.color}`}>{metric.value}</span>
              <span className={metric.color}>({metric.percentage})</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SLABreachMetricsCard;
